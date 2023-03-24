import fs from 'fs-extra';
import os from 'node:os';
import pathe from 'pathe';
import simpleGit from 'simple-git';

import { createCommand } from '../helpers';

async function cloneRepo(dirInRepo: string, path: string): Promise<void> {
  const tmpDir = await fs.mkdtemp(pathe.join(os.tmpdir(), 'myapp-'));
  console.log('Cloning repo to', tmpDir);
  const git = simpleGit(tmpDir);
  await git.clone('git@github.com:2digits-agency/2d-template.git', '.', ['--depth=1']);

  const headCommit = await git.revparse(['HEAD']);
  const tree = await git.raw(['ls-tree', '-r', '--name-only', `${headCommit}:${dirInRepo}`]);

  const entries = tree.split('\n').filter(Boolean);
  for (const entryPath of entries) {
    const destPath = pathe.join(path, entryPath);

    const gitObject = `${headCommit}:${dirInRepo}/${entryPath}`;

    console.log(gitObject);

    const type = await git.catFile(['-t', gitObject]);

    if (type.trim() === 'blob') {
      const content = await git.show([gitObject]);
      console.log('Writing file', destPath);
      await fs.outputFile(destPath, content);
    }
  }

  await fs.remove(tmpDir);
}

export const init = createCommand(['init [path]', 'i'], {
  describe: 'Initialize a new project',
  builder(args) {
    return args
      .positional('path', {
        type: 'string',
        describe: 'Where to create the project',
        normalize: true,
      })
      .option('module', {
        choices: ['trpc', 'stitches'] as const,
        describe: 'Modules to install',
        type: 'array',
        alias: 'm',
        requiresArg: true,
      })
      .option('install', {
        alias: 'i',
        type: 'boolean',
        describe: 'Install dependencies after creating the project',
      })
      .strict();
  },
  async handler(args) {
    const path = args.path ?? process.cwd();
    await cloneRepo('packages/ui', path);
    console.log(args.module);
  },
});
