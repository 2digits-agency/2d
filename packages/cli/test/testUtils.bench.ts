import { bench, describe } from 'vitest';

import { getTemplateFiles } from './testUtils';

describe('testUtils', () => {
  bench('getTemplateFiles', async () => {
    await getTemplateFiles();
  });
});
