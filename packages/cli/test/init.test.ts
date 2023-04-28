import { consola } from 'consola';
import fs from 'fs-extra';
import { globby } from 'globby';
import mock from 'mock-fs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { init } from '../src/commands/init';
import { TEMPLATE_DIR } from '../src/constants';

describe('init', () => {
  beforeEach(() => {
    mock({
      [TEMPLATE_DIR]: mock.load(TEMPLATE_DIR),
    });

    consola.wrapAll();
    consola.pauseLogs();
  });

  afterEach(() => {
    consola.resumeLogs();
    consola.restoreAll();

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
});
