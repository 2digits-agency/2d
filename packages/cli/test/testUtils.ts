import fs from 'fs-extra';
import { globby } from 'globby';
import mock from 'mock-fs';
import pathe from 'pathe';
import { expect } from 'vitest';

import { TEMPLATE_DIR } from '../src/constants';

export function getMockFsFiles() {
  return globby('./test/path/**/*', { dot: true });
}

export async function snapshotCliOutputFs() {
  const files = await getMockFsFiles();

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

export function getCombinations<TData extends string>(valuesArray: TData[]) {
  const combinations: TData[][] = [];
  const { length } = valuesArray;
  const max = Math.pow(2, length);

  for (let i = 0; i < max; i++) {
    const combination: TData[] = [];

    for (let j = 0; j < length; j++) {
      if (i & (1 << j)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        combination.push(valuesArray[j]!);
      }
    }

    if (combination.length > 0) {
      combinations.push(combination.sort());
    }
  }

  return combinations.sort();
}
