import * as p from '@clack/prompts';
import chalk from 'chalk';
import clipboardy from 'clipboardy';
import consola from 'consola';
import link from 'terminal-link';
import { z } from 'zod';

import { bugs } from '../../package.json';

import { createCommand, onCancel, promptMissingArg } from '../helpers';
import { moduleEnum, type Module } from '../schemas';
import { installDependencies } from '../utils/dependencies';
import { checkIsGitClean, getRepoRoot } from '../utils/git';
import { applyPatch, getTemplatePatches } from '../utils/patch';
import { renamePlaceholders } from '../utils/rename';
import { copyTemplate } from '../utils/templates';

export const add = createCommand(['add [module]', 'a'], {
  describe: 'Add a module to an existing project',
  builder(args) {
    return args
      .positional('module', {
        describe: 'Module to add',
        choices: moduleEnum.options,
        type: 'string',
        alias: 'm',
      })
      .option('install', {
        alias: 'i',
        type: 'boolean',
        describe: 'Install dependencies after adding the module',
      });
  },
  async handler(args) {
    p.intro(chalk.bgHex('#762BFF').hex('#FFFFFF').bold(' 2d add '));

    const path = await getRepoRoot().catch((error) => {
      consola.debug(error);

      p.log.error('Failed to get repository root.');

      return onCancel();
    });

    const isRepoClean = await checkIsGitClean(path).catch(() => false);

    if (!isRepoClean) {
      p.log.error('Please commit your changes before adding a new module.');

      return onCancel();
    }

    const mod = await promptMissingArg({
      args,
      argName: 'module',
      schema: moduleEnum,
      prompt() {
        return p.select({
          message: 'Which module do you want to install',
          options: moduleEnum.options.map((value) => ({ value })),
          initialValue: undefined as Module | undefined,
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

    p.log.step('Scaffolding module...');

    const steps: { description: string; commands: string[] }[] = [
      {
        description: 'Change directory to the project root',
        commands: [`cd ${path}`],
      },
    ];

    await copyTemplate(mod, path);

    await renamePlaceholders(path);

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

    if (install) {
      await installDependencies(path);
    } else {
      steps.push({
        description: 'Install the dependencies',
        commands: ['pnpm install'],
      });
    }

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
