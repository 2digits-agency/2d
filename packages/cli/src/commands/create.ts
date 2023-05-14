import chalk from 'chalk';
import { bugs } from '../../package.json';
import link from 'terminal-link';
import fs from 'fs-extra';
import { createCommand, promptMissingArg, validate } from '../helpers';
import pathe from 'pathe';
import * as p from '@clack/prompts';
import { consola } from 'consola';
import { moduleName } from '../schemas';
import { copyTemplate } from '../utils/templates';
import { applyPatch, getTemplatePatches } from '../utils/patch';
import { renamePlaceholders } from '../utils/rename';
import { z } from 'zod';
import type { PackageJson } from 'pkg-types';
import { installDependencies } from '../utils/dependencies';
import clipboardy from 'clipboardy';

export const create = createCommand('create [name]', {
  describe: 'Create a new module',
  builder(args) {
    return args
      .positional('name', {
        type: 'string',
        describe: 'Name of the project',
        normalize: true,
      })
      .option('install', {
        alias: 'i',
        type: 'boolean',
        describe: 'Install dependencies after creating the project',
      });
  },
  async handler(args) {
    p.intro(chalk.bgHex('#762BFF').hex('#FFFFFF').bold(' 2d create '));

    const name = await promptMissingArg({
      args,
      argName: 'name',
      schema: moduleName,
      prompt() {
        return p.text({
          message: 'What is the name of the module?',
          validate: validate(moduleName),
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

    const path = pathe.resolve('packages', name);

    p.log.info(`Creating module ${name}...`);

    const steps: { description: string; commands: string[] }[] = [];

    consola.debug(args, { name, path });

    await copyTemplate('module', path);

    await renamePlaceholders(path);

    const patches = await getTemplatePatches('module');

    for (const patch of patches) {
      const step = await applyPatch('module', patch, path);
      if (step) {
        steps.push(step);

        if (install && step.description.includes('package.json')) {
          install = false;
          p.log.warn('Skipping dependency installation because of merge conflict');
        }
      }
    }

    const pkgJsonPath = pathe.join(path, 'package.json');
    const pkg = (await fs.readJson(pkgJsonPath)) as PackageJson;
    pkg.name = `@mod/${name}`;
    await fs.writeJson(pkgJsonPath, pkg, { spaces: 2 });

    if (install) {
      await installDependencies(path);
    } else {
      steps.push({
        description: 'Install the dependencies',
        commands: ['pnpm install'],
      });
    }

    p.log.info(`Created module ${name}`);

    if (steps.length > 0) {
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
    }

    p.outro(
      `If you encounter any problems, please open an issue on ${link(
        chalk.hex('#762BFF').underline`Github`,
        bugs.url,
      )}`,
    );
  },
});
