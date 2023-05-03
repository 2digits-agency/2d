import fs from 'fs-extra';
import { globby } from 'globby';
import mock from 'mock-fs';
import pathe from 'pathe';
import { expect } from 'vitest';

import { TEMPLATE_DIR } from '../src/constants';

export async function snapshotCliOutputFs() {
  const files = await globby('./test/path/**/*', { dot: true });

  const fileContents = {} as Record<string, string>;

  for (const file of files) {
    fileContents[file] = await fs.readFile(file, { encoding: 'utf8' });
  }

  mock.restore();

  for (const file of files) {
    expect(fileContents[file]).toMatchSnapshot(file);
  }
}

export async function getTemplateFiles() {
  const files = await globby('./**/*', {
    dot: true,
    gitignore: true,
    cwd: TEMPLATE_DIR,
    ignore: ['**/CHANGELOG.md'],
  });

  const mockFiles = {} as Record<string, string>;

  for (const file of files) {
    const path = pathe.join(TEMPLATE_DIR, file);
    mockFiles[path] = await fs.readFile(path, { encoding: 'utf8' });
  }

  return mockFiles;
}
