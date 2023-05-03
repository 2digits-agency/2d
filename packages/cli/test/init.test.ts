import consola from 'consola';
import mock from 'mock-fs';
import { afterEach, beforeEach, describe, it } from 'vitest';

import { init } from '../src/commands/init';
import { getTemplateFiles, snapshotCliOutputFs } from './testUtils';

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

describe('base', () => {
  it('should create a base project', async () => {
    await init.handler({
      path: './test/path',
      module: [],
      install: false,
      name: 'test',
    });

    await snapshotCliOutputFs();
  });

  describe('web', () => {
    it('should create a web app', async () => {
      await init.handler({
        path: './test/path',
        module: ['web'],
        install: false,
        name: 'test',
      });

      await snapshotCliOutputFs();
    });

    describe('stitches', () => {
      it('should add a stitches module', async () => {
        await init.handler({
          path: './test/path',
          module: ['web', 'stitches'],
          install: false,
          name: 'test',
        });

        await snapshotCliOutputFs();
      });
    });

    describe('trpc', () => {
      it('should add a trpc module', async () => {
        await init.handler({
          path: './test/path',
          module: ['web', 'trpc'],
          install: false,
          name: 'test',
        });

        await snapshotCliOutputFs();
      });
    });
  });
});
