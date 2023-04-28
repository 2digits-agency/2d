import fs from 'fs-extra';
import { globby } from 'globby';
import mock from 'mock-fs';
import pathe from 'pathe';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { init } from '../src/commands/init';
import { TEMPLATE_DIR } from '../src/constants';

describe('init', () => {
  beforeEach(async () => {
    const files = await globby('./**/*', { dot: true, gitignore: true, cwd: TEMPLATE_DIR });

    const mockFiles = {} as Record<string, string>;

    for (const file of files) {
      const path = pathe.join(TEMPLATE_DIR, file);
      mockFiles[path] = await fs.readFile(path, { encoding: 'utf8' });
    }

    mock(mockFiles);
  });

  afterEach(() => {
    mock.restore();
  });

  test('base', async () => {
    await init.handler({
      path: './test/path',
      module: [],
      install: false,
      name: 'test',
    });

    const files = await globby('./test/path/**/*', { dot: true });

    const fileContents = {} as Record<string, string>;

    for (const file of files) {
      fileContents[file] = await fs.readFile(file, { encoding: 'utf8' });
    }

    mock.restore();

    expect(fileContents).toMatchSnapshot();
  });

  test('base + web', async () => {
    await init.handler({
      path: './test/path',
      module: ['web'],
      install: false,
      name: 'test',
    });

    const files = await globby('./test/path/**/*', { dot: true });

    const fileContents = {} as Record<string, string>;

    for (const file of files) {
      fileContents[file] = await fs.readFile(file, { encoding: 'utf8' });
    }

    mock.restore();

    expect(fileContents).toMatchSnapshot();
  });

  test('base + web + trpc', async () => {
    await init.handler({
      path: './test/path',
      module: ['web', 'trpc'],
      install: false,
      name: 'test',
    });

    const files = await globby('./test/path/**/*', { dot: true });

    const fileContents = {} as Record<string, string>;

    for (const file of files) {
      fileContents[file] = await fs.readFile(file, { encoding: 'utf8' });
    }

    mock.restore();

    expect(fileContents).toMatchSnapshot();
  });
});
