import * as p from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import pathe from 'pathe';
import link from 'terminal-link';
import type { Argv } from 'yargs';
import { z } from 'zod';
import clipboardy from 'clipboardy';

import { bugs } from '../../package.json';
import type packageJson from '../../templates/base/package.json';
import { createCommand, promptMissingArg, validate } from '../helpers';
import { installDependencies } from '../utils/dependencies';
import { applyPatch, getTemplatePatches } from '../utils/patch';
import { renamePlaceholders } from '../utils/rename';
import { copyTemplate } from '../utils/templates';
import { initializeRepository } from '../utils/git';
import { consola } from 'consola';
import { appName, appPath, moduleEnum } from '../schemas';

const appModule = z.array(moduleEnum);

interface InitArguments {
  name: string;
  path: string;
  module: z.infer<typeof appModule>;
  install: boolean;
  git: boolean;
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
      .option('git', {
        type: 'boolean',
        describe: 'Initialize a git repository',
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

    const modules = await promptMissingArg({
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

    let install = await promptMissingArg({
      args,
      argName: 'install',
      schema: z.boolean(),
      prompt: () =>
        p.confirm({
          message: 'Install dependencies',
          initialValue: true,
        }),
    });

    const git = await promptMissingArg({
      args,
      argName: 'git',
      schema: z.boolean(),
      prompt: () =>
        p.confirm({
          message: 'Initialize a git repository',
          initialValue: true,
        }),
    });

    p.log.step('Scaffolding project...');

    const steps: { description: string; commands: string[] }[] = [
      {
        description: 'Change directory to the project root',
        commands: [`cd ${path}`],
      },
    ];

    await copyTemplate('base', path);

    for (const mod of modules) {
      await copyTemplate(mod, path);
    }

    await renamePlaceholders(path);

    for (const mod of ['base', ...modules] as const) {
      const patches = await getTemplatePatches(mod);

      for (const patch of patches) {
        const step = await applyPatch(mod, patch, path);
        if (step) {
          steps.push(step);

          if (install && step.description.includes('package.json')) {
            install = false;
            p.log.warn('Skipping dependency installation because of merge conflict');
          }
        }
      }
    }

    const pkgJsonPath = pathe.join(path, 'package.json');
    const pkg = (await fs.readJson(pkgJsonPath)) as typeof packageJson;
    pkg.name = name;
    await fs.writeJson(pkgJsonPath, pkg, { spaces: 2 });

    if (install) {
      await installDependencies(path);
    } else {
      steps.push({
        description: 'Install the dependencies',
        commands: ['pnpm install'],
      });
    }

    if (git) {
      await initializeRepository(path);
    }

    steps.push({
      description: 'Start the development server',
      commands: ['pnpm dev'],
    });

    p.note(
      steps
        .map(({ description, commands }) => {
          const step = [description];
          for (const command of commands) {
            step.push(chalk.bold(`${chalk.dim`$`} ${command}`));
          }
          return step.join('\n');
        })
        .join('\n\n'),
      'Next steps',
    );

    const commands = steps.flatMap(({ commands }) => commands).join(' && \\\n');

    try {
      await clipboardy.write(commands);

      p.log.info('Copied the abovementioned commands to your clipboard');
    } catch {
      consola.debug('Could not copy commands to clipboard');
    }

    p.outro(
      `If you encounter any problems, please open an issue on ${link(
        chalk.hex('#762BFF').underline`Github`,
        bugs.url,
      )}`,
    );
  },
});
