import fs from 'fs-extra';
import pathe from 'pathe';
import { z } from 'zod';

export const appName = z
  .string()
  .nonempty()
  .regex(/^[\da-z~-][\d._a-z~-]*$/, {
    message: 'Please check https://docs.npmjs.com/cli/v9/configuring-npm/package-json#name',
  });

export const moduleEnum = z.enum([
  'web',
  'storybook',
  'trpc',
  'tailwind',
  'swagger-sdk',
  'gql-codegen',
]);

const VALID_PROJECT_DIRECTORY_SAFE_LIST = new Set([
  '.DS_Store',
  '.gitkeep',
  '.gitattributes',
  '.gitignore',
  '.npmignore',
  'LICENSE',
  'Thumbs.db',
]);

function isEmpty(dirPath: string) {
  try {
    // Throws if the directory does not exist.
    const files = fs.readdirSync(dirPath);

    // If the directory is not empty, check if it contains only safe files.
    return files.every((content) => VALID_PROJECT_DIRECTORY_SAFE_LIST.has(content));
  } catch {
    // If the directory does not exist, it is considered empty.
    return true;
  }
}

export const appPath = z.string().nonempty().refine(isEmpty, 'Directory has to be empty');

export const moduleName = (root: string) =>
  appName.refine(
    (name) => isEmpty(pathe.resolve(root, 'packages', name)),
    'Directory has to be empty',
  );
