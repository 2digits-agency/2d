import * as p from '@clack/prompts';
import chalk from 'chalk';
import clipboardy from 'clipboardy';
import { consola } from 'consola';
import fs from 'fs-extra';
import pathe from 'pathe';
import type { PackageJson } from 'pkg-types';
import link from 'terminal-link';
import { z } from 'zod';

import { bugs } from '../../package.json';

import { createCommand, onCancel, promptMissingArg, validate } from '../helpers';
import { moduleName } from '../schemas';
import { installDependencies } from '../utils/dependencies';
import { checkIsGitClean, getRepoRoot } from '../utils/git';
import { applyPatch, getTemplatePatches } from '../utils/patch';
import { renamePlaceholders } from '../utils/rename';
import { copyTemplate } from '../utils/templates';

export const create = createCommand('create [name]', {
  describe: 'Create a new module',
  builder(args) {
    return args
      .positional('name', {
        type: 'string',
        describe: 'Name of the project',
        normalize: true,
      })
      .option('install', {
        alias: 'i',
        type: 'boolean',
        describe: 'Install dependencies after creating the project',
      });
  },
  async handler(args) {
    p.intro(chalk.bgHex('#762BFF').hex('#FFFFFF').bold(' 2d create '));

    const root = await getRepoRoot().catch((error) => {
      consola.debug(error);

      p.log.error('Failed to get repository root.');

      return onCancel();
    });

    const isRepoClean = await checkIsGitClean(root).catch(() => false);

    if (!isRepoClean) {
      p.log.error('Please commit your changes before creating a new module.');

      return onCancel();
    }

    const name = await promptMissingArg({
      args,
      argName: 'name',
      schema: moduleName(root),
      prompt() {
        return p.text({
          message: 'What is the name of the module?',
          validate: validate(moduleName(root)),
        });
      },
    });

    let install = await promptMissingArg({
      args,
      argName: 'install',
      schema: z.boolean(),
      prompt: () =>
        p.confirm({
          message: 'Install dependencies',
          initialValue: true,
        }),
    });

    const path = pathe.resolve(root, 'packages', name);

    p.log.info(`Creating module ${name}...`);

    const steps: { description: string; commands: string[] }[] = [];

    consola.debug(args, { name, path });

    await copyTemplate('module', path);

    await renamePlaceholders(path);

    const patches = await getTemplatePatches('module');

    for (const patch of patches) {
      const step = await applyPatch('module', patch, path);
      if (step) {
        steps.push(step);

        if (install && step.description.includes('package.json')) {
          install = false;
          p.log.warn('Skipping dependency installation because of merge conflict');
        }
      }
    }

    const pkgJsonPath = pathe.join(path, 'package.json');
    const pkg = (await fs.readJson(pkgJsonPath)) as PackageJson;
    pkg.name = `@mod/${name}`;
    await fs.writeJson(pkgJsonPath, pkg, { spaces: 2 });

    if (install) {
      await installDependencies(path);
    } else {
      steps.push({
        description: 'Install the dependencies',
        commands: ['pnpm install'],
      });
    }

    p.log.info(`Created module ${name}`);

    if (steps.length > 0) {
      p.note(
        steps
          .map(({ description, commands }) => {
            const step = [description];
            for (const command of commands) {
              step.push(chalk.bold(`${chalk.dim`$`} ${command}`));
            }
            return step.join('\n');
          })
          .join('\n\n'),
        'Next steps',
      );

      const commands = steps.flatMap(({ commands }) => commands).join(' && \\\n');

      try {
        await clipboardy.write(commands);

        p.log.info('Copied the abovementioned commands to your clipboard');
      } catch {
        consola.debug('Could not copy commands to clipboard');
      }
    }

    return p.outro(
      `If you encounter any problems, please open an issue on ${link(
        chalk.hex('#762BFF').underline`Github`,
        bugs.url,
      )}`,
    );
  },
});
