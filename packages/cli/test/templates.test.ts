import consola from 'consola';
import mock from 'mock-fs';
import { afterEach, beforeEach, describe, expectTypeOf, it, test } from 'vitest';

import { templates, type Template } from '../src/constants';
import { moduleEnum } from '../src/schemas';
import { copyTemplate } from '../src/utils/templates';
import { getCombinations, getTemplateFiles, snapshotCliOutputFs } from './testUtils';

const templateNames = Object.keys(templates) as Template[];

const combinations = getCombinations(templateNames);

describe('copyTemplate', async () => {
  const mockFileSystem = await getTemplateFiles();

  beforeEach(() => {
    mock(mockFileSystem);

    consola.wrapStd();
    consola.pauseLogs();
  });

  afterEach(() => {
    mock.restore();

    consola.resumeLogs();
    consola.restoreAll();
  });

  for (const combination of combinations) {
    const name = combination.join(' + ');

    test(name, async () => {
      for (const template of combination) {
        await copyTemplate(template, './test/path');
      }

      await snapshotCliOutputFs();
    });
  }
});

describe('types', () => {
  it('should export a correct Templates type', () => {
    expectTypeOf(moduleEnum.options).items.toMatchTypeOf<Template>();
  });
});
