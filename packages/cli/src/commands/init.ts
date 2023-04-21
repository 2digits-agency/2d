import * as p from '@clack/prompts';
import chalk from 'chalk';
import { consola } from 'consola';
import fs from 'fs-extra';
import pathe from 'pathe';
import link from 'terminal-link';
import type { Argv } from 'yargs';
import { z } from 'zod';

import { bugs } from '../../package.json';
import type packageJson from '../../templates/base/package.json';
import { createCommand, promptMissingArg, validate } from '../helpers';
import { installDependencies } from '../utils/dependencies';
import { copyTemplate } from '../utils/templates';

const moduleEnum = z.enum(['trpc', 'stitches']);

const appModule = z.array(moduleEnum);

interface InitArguments {
  name: string;
  path: string;
  module: z.infer<typeof appModule>;
  install: boolean;
}

const appName = z
  .string()
  .nonempty()
  .regex(/^(?:@[\d*a-z~-][\d*._a-z~-]*\/)?[\da-z~-][\d._a-z~-]*$/, {
    message: 'Please check https://docs.npmjs.com/cli/v9/configuring-npm/package-json#name',
  });

const appPath = z.string().nonempty().refine(isEmpty, 'Directory has to be empty');

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
        choices: moduleEnum.options,
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

    const pathInput = await promptMissingArg({
      args,
      argName: 'path',
      schema: appPath,
      prompt() {
        return p.text({
          message: 'Where to create the project',
          initialValue: './',
          validate: validate(appPath),
        });
      },
    });

    const path = pathe.resolve(pathInput);

    const name = await promptMissingArg({
      args,
      argName: 'name',
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
      args,
      argName: 'module',
      schema: appModule,
      prompt() {
        return p.multiselect({
          message: 'Which modules do you want to install',
          options: moduleEnum.options.map((module) => ({ label: module, value: module })),
          required: false,
          initialValues: [] as z.infer<typeof appModule>,
        });
      },
    });

    consola.debug('module', module);

    const install = await promptMissingArg({
      args,
      argName: 'install',
      schema: z.boolean(),
      prompt: () =>
        p.confirm({
          message: 'Install dependencies',
          initialValue: true,
        }),
    });

    p.log.step('Scaffolding project...');

    await copyTemplate('base', path);

    const pkgJsonPath = pathe.join(path, 'package.json');
    const pkg = (await fs.readJson(pkgJsonPath)) as typeof packageJson;
    pkg.name = name;
    await fs.writeJson(pkgJsonPath, pkg, { spaces: 2 });

    if (install) {
      await installDependencies(path);
    }

    p.note(
      `${chalk.bold(
        `cd ${link(chalk.underline(path), `vscode://file/${path}`, { fallback: false })}`,
      )}\n${chalk.bold('pnpm dev')}`,
      'Next steps',
    );

    p.outro(
      `If you encounter any problems, please open an issue on ${link(
        chalk.hex('#762BFF').underline`Github`,
        bugs.url,
      )}`,
    );
  },
});
