import * as p from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'pathe';
import type { Argv } from 'yargs';
import { z } from 'zod';

import { createCommand } from '../helpers';

interface InitArguments {
  name: string;
  path: string;
}

const appName = z.string().regex(/^(?:@[\d*a-z~-][\d*._a-z~-]*\/)?[\da-z~-][\d._a-z~-]*$/, {
  message: 'Please check https://docs.npmjs.com/cli/v9/configuring-npm/package-json#name',
});

const appPath = z.string().nonempty().refine(isEmpty, 'Directory has to be empty');

// Some existing files and directories can be safely ignored when checking if a directory is a valid project directory.
// https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/create-react-app/createReactApp.js#L907-L934
const VALID_PROJECT_DIRECTORY_SAFE_LIST = [
  /^\.DS_Store/,
  /^\.git/,
  /^\.gitkeep/,
  /^\.gitattributes/,
  /^\.gitignore/,
  /^\.npmignore/,
  /^LICENSE/,
  /^Thumbs\.db/,
];

function isEmpty(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    return true;
  }

  const files = fs.readdirSync(dirPath);

  return !files.some(
    (content) =>
      !VALID_PROJECT_DIRECTORY_SAFE_LIST.some((safeContent) => safeContent.test(content)),
  );
}

// const initDefaults: InitArguments = {
//   name: 'my-2d-app',
//   path: '.',
// };

function checkCancel<TValue>(value: TValue): Exclude<TValue, symbol> {
  if (p.isCancel(value)) onCancel();

  return value as Exclude<TValue, symbol>;
}
function onCancel() {
  p.cancel('Operation cancelled.');
  process.exit(0);
}

export const init = createCommand(['init [path]', 'i'], {
  describe: 'Initialize a new project',
  builder(args) {
    return args
      .positional('path', {
        type: 'string',
        describe: 'Where to create the project',
        normalize: true,
      })
      .option('module', {
        choices: ['trpc', 'stitches'] as const,
        describe: 'Modules to install',
        type: 'array',
        alias: 'm',
        requiresArg: true,
      })
      .option('install', {
        alias: 'i',
        type: 'boolean',
        describe: 'Install dependencies after creating the project',
      })
      .option('name', {
        type: 'string',
        describe: 'Name of the project',
        alias: 'n',
      })
      .strict() satisfies Argv<Partial<InitArguments>>;
  },
  async handler(args) {
    const initArguments = args;

    p.intro(chalk.bgHex('#762BFF').hex('#FFFFFF').bold(' 2d init '));

    p.log.info(JSON.stringify(args, undefined, 2));

    initArguments.name ??= await p
      .text({
        message: 'What is the name of the project',
        defaultValue: 'asdf',
        validate(value) {
          const result = appName.safeParse(value);
          if (!result.success) return result.error.flatten().formErrors.join('\n');
          return;
        },
      })
      .then(checkCancel);

    initArguments.path ??= await p
      .text({
        message: 'Where to create the project',
        validate(value) {
          const result = appPath.safeParse(value);
          if (!result.success) return result.error.issues.pop()?.message;
          return;
        },
      })
      .then(checkCancel)
      .then(path.resolve);

    p.log.info(`Creating ${chalk.bold(initArguments.name)} in ${chalk.bold(initArguments.path)}`);
    p.log.message('Installing dependencies...');
  },
});
