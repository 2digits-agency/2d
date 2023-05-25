import { bench, describe } from 'vitest';

import { templates, type Template } from '../src/constants';
import { getCombinations, getTemplateFiles } from './testUtils';

const templateNames = Object.keys(templates) as Template[];

describe('getTemplateFiles', () => {
  bench('All templates', async () => {
    await getTemplateFiles();
  });
});

describe('getCombinations', () => {
  bench('templates', () => {
    getCombinations(templateNames);
  });
});
