import fs from 'fs-extra';
import mock from 'mock-fs';
import pathe from 'pathe';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { findPlaceholders, renameFile, renamePlaceholders } from '../src/utils/rename';

describe('findPlaceholders', () => {
  beforeEach(() => {
    mock({
      path: {
        to: {
          placeholders: {
            '_2d_file.txt': '',
            dir: {
              'file_2d_.txt': '',
            },
          },
        },
      },
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('No placeholders found', async () => {
    await expect(findPlaceholders('non/existent/path')).resolves.toEqual([]);
  });

  test('Two placeholders found', async () => {
    await expect(findPlaceholders('path/to/placeholders')).resolves.toEqual([
      pathe.resolve('path/to/placeholders/_2d_file.txt'),
      pathe.resolve('path/to/placeholders/dir/file_2d_.txt'),
    ]);
  });
});

describe('renameFile', () => {
  beforeEach(() => {
    mock({
      'path/to/file_2d_.txt': '',
      'path/to/file_2d_2d_file.txt': '',
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('Rename existing file', async () => {
    await renameFile('path/to/file_2d_.txt');

    expect(fs.existsSync('path/to/file.txt')).toBe(true);
  });

  test('Rename file with multiple dashes', async () => {
    await renameFile('path/to/file_2d_2d_file.txt');

    expect(fs.existsSync('path/to/file2d_file.txt')).toBe(true);
  });

  test('Rename file with dash at beginning', async () => {
    await expect(renameFile('path/to/_2d_file.txt')).rejects.toThrow();
  });

  test('Rename file with dash at end', async () => {
    await expect(renameFile('path/to/file_.txt')).rejects.toThrow();
  });

  test('Rename file with dash in middle', async () => {
    await renameFile('path/to/file_2d_2d_file.txt');

    expect(fs.existsSync('path/to/file2d_file.txt')).toBe(true);
  });

  test('Rename non-existent file', async () => {
    await expect(renameFile('path/to/nonexistent_2d.txt')).rejects.toThrow();
  });
});

describe('renamePlaceholders', () => {
  beforeEach(() => {
    mock({
      'path/to/placeholders/_2d_file.txt': '',
      'path/to/placeholders/dir/file_2d.txt': '',
      'path/to/placeholders/dir/file_2d_2d.txt': '',
      'path/to/placeholders/dir/file.txt': '',
      'path/to/placeholders/dir2/file_2d.txt': '',
      'path/to/placeholders/dir2/file_2d_.txt': '',
      'path/to/placeholders/file_2d.txt': '',
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('No placeholders found', async () => {
    await renamePlaceholders('path/to/nonexistent');

    expect(fs.existsSync('path/to/placeholders/file.txt')).toBe(false);
  });

  test('One placeholder found', async () => {
    await renamePlaceholders('path/to/placeholders/dir2');

    expect(fs.existsSync('path/to/placeholders/file.txt')).toBe(false);
    expect(fs.existsSync('path/to/placeholders/dir2/file.txt')).toBe(true);
  });

  test('No placeholders in path', async () => {
    await renamePlaceholders('path/to/placeholders/dir');

    expect(fs.existsSync('path/to/placeholders/dir/file.txt')).toBe(true);
  });

  test('Only directories in path', async () => {
    await renamePlaceholders('path/to/placeholders/dir');

    expect(fs.existsSync('path/to/placeholders/dir/file.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/dir/file_3d.txt')).toBe(false);
    expect(fs.existsSync('path/to/placeholders/dir/file_2d_2d.txt')).toBe(false);
  });

  test('Only files in path', async () => {
    await renamePlaceholders('path/to/file_2d.txt');

    expect(fs.existsSync('path/to/file_2d.txt')).toBe(false);
    expect(fs.existsSync('path/to/file.txt')).toBe(false);
  });

  test('Subdirectories with placeholders', async () => {
    await renamePlaceholders('path/to/placeholders');

    expect(fs.existsSync('path/to/placeholders/file.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/dir/file.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/dir/file_2d_2d.txt')).toBe(false);
    expect(fs.existsSync('path/to/placeholders/dir2/file.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/dir2/file_2d_.txt')).toBe(false);
    expect(fs.existsSync('path/to/placeholders/dir2/file_2d.txt')).toBe(true);
  });

  test('Placeholders in root directory', async () => {
    await renamePlaceholders('path/to');

    expect(fs.existsSync('path/to/placeholders/file.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/file_2d.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/_2d_file.txt')).toBe(false);
  });

  test('Multiple placeholders in directory', async () => {
    await renamePlaceholders('path/to/placeholders/dir');

    expect(fs.existsSync('path/to/placeholders/dir/file.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/dir/file_2d.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/dir/file_2d_2d.txt')).toBe(false);
    expect(fs.existsSync('path/to/placeholders/dir/file_2d_2d.txt')).toBe(false);
  });

  test('Multiple subdirectories with placeholders', async () => {
    await renamePlaceholders('path/to/placeholders');

    expect(fs.existsSync('path/to/placeholders/file.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/dir/file.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/dir/file_2d_2d.txt')).toBe(false);
    expect(fs.existsSync('path/to/placeholders/dir2/file.txt')).toBe(true);
    expect(fs.existsSync('path/to/placeholders/dir2/file_2d.txt')).toBe(true);
  });
});
