import mock from 'mock-fs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { createIgnoreFilter, parseIgnoreLines, readIgnoreFile } from '../src/utils/ignore';

const ignoreItems = ['node_modules', '.DS_Store', 'foo', 'bar', 'baz'];

describe('readIgnoreFile', () => {
  beforeEach(() => {
    mock({
      path: {
        to: {
          ignore: ignoreItems.join('\n'),
        },
      },
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('Valid ignore file path', async () => {
    await expect(readIgnoreFile('path/to/ignore')).resolves.toEqual(ignoreItems);
  });

  test('Invalid ignore file path', async () => {
    await expect(readIgnoreFile('invalid/path/to/ignore')).resolves.toBeUndefined();
  });
});

describe('parseIgnoreLines', () => {
  test('Valid ignore lines', () => {
    expect(parseIgnoreLines(ignoreItems)).toEqual(ignoreItems);
    expect(parseIgnoreLines(['node_modules ', '.DS_Store', 'foo/'])).toEqual([
      'node_modules',
      '.DS_Store',
      'foo/',
    ]);
    expect(parseIgnoreLines(['# comment', '  ', '/ invalid/path'])).toEqual([]);
    expect(parseIgnoreLines(['foo', './../bar/ baz'])).toEqual(['foo']);
  });

  test('Invalid ignore lines', () => {
    expect(parseIgnoreLines(['', ' ', '# comment', '/ invalid/path'])).toEqual([]);
  });
});

describe('createIgnoreFilter', () => {
  beforeEach(() => {
    mock({
      'path/to/ignore1': ['node_modules', '.DS_Store', 'foo'].join('\n'),
      'path/to/ignore2': ['bar', 'baz'].join('\n'),
      'path/to/ignore3': '',
      'path/to/ignore4': 'invalid/path',
      'path/to/ignore5': ['foo', 'path/to/invalid'].join('\n'),
      'path/to/ignore6': ['foo', 'path/to/ignore1'].join('\n'),
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('Valid ignore file paths', async () => {
    const filter = await createIgnoreFilter(['path/to/ignore1', 'path/to/ignore2']);
    expect(filter.ignores('node_modules')).toBe(true);
    expect(filter.ignores('.DS_Store')).toBe(true);
    expect(filter.ignores('foo')).toBe(true);
    expect(filter.ignores('bar')).toBe(true);
    expect(filter.ignores('baz')).toBe(true);
    expect(filter.ignores('qux')).toBe(false);
  });

  test('Empty ignore file path array', async () => {
    const filter = await createIgnoreFilter([]);
    expect(filter.ignores('node_modules')).toBe(false);
    expect(filter.ignores('.DS_Store')).toBe(false);
    expect(filter.ignores('foo')).toBe(false);
    expect(filter.ignores('bar')).toBe(false);
    expect(filter.ignores('baz')).toBe(false);
    expect(filter.ignores('qux')).toBe(false);
  });

  test('Ignore file path with invalid contents', async () => {
    const filter = await createIgnoreFilter(['path/to/ignore3']);
    expect(filter.ignores('node_modules')).toBe(false);
    expect(filter.ignores('.DS_Store')).toBe(false);
    expect(filter.ignores('foo')).toBe(false);
    expect(filter.ignores('bar')).toBe(false);
    expect(filter.ignores('baz')).toBe(false);
    expect(filter.ignores('qux')).toBe(false);
  });

  test('Ignore file path with invalid path', async () => {
    const filter = await createIgnoreFilter(['path/to/ignore4']);
    expect(filter.ignores('node_modules')).toBe(false);
    expect(filter.ignores('.DS_Store')).toBe(false);
    expect(filter.ignores('foo')).toBe(false);
    expect(filter.ignores('bar')).toBe(false);
    expect(filter.ignores('baz')).toBe(false);
    expect(filter.ignores('qux')).toBe(false);
  });

  test('Ignore file path with mix of valid and invalid paths', async () => {
    const filter = await createIgnoreFilter(['path/to/ignore5']);
    expect(filter.ignores('node_modules')).toBe(false);
    expect(filter.ignores('.DS_Store')).toBe(false);
    expect(filter.ignores('foo')).toBe(true);
    expect(filter.ignores('bar')).toBe(false);
    expect(filter.ignores('baz')).toBe(false);
    expect(filter.ignores('qux')).toBe(false);
  });

  test('Ignore file path with duplicates', async () => {
    const filter = await createIgnoreFilter(['path/to/ignore1', 'path/to/ignore6']);
    expect(filter.ignores('node_modules')).toBe(true);
    expect(filter.ignores('.DS_Store')).toBe(true);
    expect(filter.ignores('foo')).toBe(true);
    expect(filter.ignores('bar')).toBe(false);
    expect(filter.ignores('baz')).toBe(false);
    expect(filter.ignores('qux')).toBe(false);
  });
});
