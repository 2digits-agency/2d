import consola from 'consola';
import mock from 'mock-fs';
import { afterEach, beforeEach, describe, expectTypeOf, it, test } from 'vitest';

import { moduleEnum } from '../src/commands/init';
import type { Template } from '../src/constants';
import { copyTemplate } from '../src/utils/templates';
import { getTemplateFiles, snapshotCliOutputFs } from './testUtils';

describe('copyTemplate', async () => {
  const mockFileSystem = await getTemplateFiles();

  beforeEach(() => {
    mock(mockFileSystem);

    consola.wrapAll();
    consola.pauseLogs();
  });

  afterEach(() => {
    mock.restore();

    consola.resumeLogs();
    consola.restoreAll();
  });

  test('base', async () => {
    await copyTemplate('base', './test/path');

    await snapshotCliOutputFs();
  });

  test('web', async () => {
    await copyTemplate('web', './test/path');

    await snapshotCliOutputFs();
  });

  test('base + web', async () => {
    await copyTemplate('base', './test/path');
    await copyTemplate('web', './test/path');

    await snapshotCliOutputFs();
  });
});

describe('types', () => {
  it('should export a correct Templates type', () => {
    expectTypeOf(moduleEnum.options).items.toMatchTypeOf<Template>();
  });
});
