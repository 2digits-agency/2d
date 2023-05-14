import consola from 'consola';
import mock from 'mock-fs';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, test } from 'vitest';

import type { Template } from '../src/constants';
import { templates } from '../src/constants';
import { copyTemplate } from '../src/utils/templates';
import { getCombinations, getMockFsFiles, getTemplateFiles } from './testUtils';
import { moduleEnum } from '../src/schemas';

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

      const files = await getMockFsFiles();

      mock.restore();

      consola.debug(files);

      expect(files).toMatchSnapshot();
    });
  }
});

describe('types', () => {
  it('should export a correct Templates type', () => {
    expectTypeOf(moduleEnum.options).items.toMatchTypeOf<Template>();
  });
});
