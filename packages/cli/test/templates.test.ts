import consola from 'consola';
import fs from 'fs-extra';
import { globby } from 'globby';
import mock from 'mock-fs';
import pathe from 'pathe';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { TEMPLATE_DIR } from '../src/constants';
import { copyTemplate } from '../src/utils/templates';

describe('copyTemplate', () => {
  beforeEach(async () => {
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

    mock(mockFiles);

    consola.wrapAll();
    consola.pauseLogs();
  });

  afterEach(() => {
    consola.resumeLogs();
    consola.restoreAll();

    mock.restore();
  });

  test('base', async () => {
    await copyTemplate('base', './test/path');

    const files = await globby('./test/path/**/*', { dot: true });

    mock.restore();

    expect(files).toMatchSnapshot();
  });

  test('web', async () => {
    await copyTemplate('web', './test/path');

    const files = await globby('./test/path/**/*', { dot: true });

    mock.restore();

    expect(files).toMatchSnapshot();
  });

  test('base + web', async () => {
    await copyTemplate('base', './test/path');
    await copyTemplate('web', './test/path');

    const files = await globby('./test/path/**/*', { dot: true });

    mock.restore();

    expect(files).toMatchSnapshot();
  });
});
