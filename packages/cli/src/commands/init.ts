import p from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import pathe from 'pathe';
import type { Argv } from 'yargs';
import { z } from 'zod';

import { PKG_ROOT } from '../constants';
import { createCommand, onCancel, promptMissingArg, validate } from '../helpers';

const modules = ['trpc', 'stitches'] as const;

interface InitArguments {
  name: string;
  path: string;
  module: (typeof modules)[number][];
  install: boolean;
}

const appName = z
  .string()
  .nonempty()
  .regex(/^(?:@[\d*a-z~-][\d*._a-z~-]*\/)?[\da-z~-][\d._a-z~-]*$/, {
    message: 'Please check https://docs.npmjs.com/cli/v9/configuring-npm/package-json#name',
  });

const appPath = z.string().nonempty().refine(isEmpty, 'Directory has to be empty');

const appModule = z.array(z.enum(modules));

// Some existing files and directories can be safely ignored when checking if a directory is a valid project directory.
// https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/create-react-app/createReactApp.js#L907-L934
const VALID_PROJECT_DIRECTORY_SAFE_LIST = new Set([
  '.DS_Store',
  '.git',
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
        choices: modules,
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
    p.intro(chalk.bgHex('#762BFF').hex('#FFFFFF').bold(' 2d init '));

    const path = await promptMissingArg({
      arg: args.path,
      schema: appPath,
      prompt() {
        return p.text({
          message: 'Where to create the project',
          initialValue: './',
          validate: validate(appPath),
        });
      },
    });

    const name = await promptMissingArg({
      arg: args.name,
      schema: appName,
      prompt() {
        return p.text({
          message: 'What is the name of the project',
          validate: validate(appName),
          initialValue: pathe.basename(path),
        });
      },
    });

    const module = await promptMissingArg({
      arg: args.module,
      schema: appModule,
      prompt() {
        return p.multiselect({
          message: 'Which modules do you want to install',
          options: modules.map((module) => ({ label: module, value: module })),
          required: false,
        });
      },
    });

    const install = await promptMissingArg({
      arg: args.install,
      schema: z.boolean(),
      prompt: () =>
        p.confirm({
          message: 'Install dependencies',
        }),
    });

    const initParams = { name, path, module, install } satisfies InitArguments;

    p.log.step('Scaffolding project...');

    await scaffoldProject(initParams);

    p.log.message('Installing dependencies...');

    p.outro('Done!');
  },
});

async function scaffoldProject(args: InitArguments) {
  const spinner = p.spinner();

  spinner.start(`Creating ${chalk.bold(args.name)} in ${chalk.bold(args.path)}...`);

  try {
    await fs.copy(pathe.join(PKG_ROOT, 'templates', 'base'), args.path);

    spinner.stop(`Created ${chalk.bold(args.name)} in ${chalk.bold(args.path)}`);
  } catch {
    spinner.stop();

    p.log.error(`Failed to create ${chalk.bold(args.name)} in ${chalk.bold(args.path)}`);

    onCancel();
  }
  // Copy the template
  // Install dependencies
  // Create git repo
}
