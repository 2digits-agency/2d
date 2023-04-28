import { consola } from 'consola';
import { globby } from 'globby';
import mock from 'mock-fs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { TEMPLATE_DIR } from '../src/constants';
import { copyTemplate } from '../src/utils/templates';

describe('copyTemplate', () => {
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
