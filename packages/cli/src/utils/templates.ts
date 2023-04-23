import chalk from 'chalk';
import { createConsola } from 'consola';
import fs from 'fs-extra';
import pathe from 'pathe';

import { Spinner } from '@2digits/log';

import base from '../../public/templates/base/package.json';
import web from '../../public/templates/web/apps/web/package.json';
import { TEMPLATE_DIR } from '../constants';
import { onCancel } from '../helpers';
import { createIgnoreFilter } from './ignore';

const consola = createConsola({ defaults: { tag: 'utils/templates' } });

const rootIgnoreFile = pathe.join(TEMPLATE_DIR, '.gitignore');

export const templates = {
  base,
  web,
} as const;

export type Template = keyof typeof templates;

export async function copyTemplate(template: Template, path: string) {
  const sourceDir = pathe.join(TEMPLATE_DIR, template);

  consola.debug('sourceDir', sourceDir);

  const templateIgnoreFile = pathe.join(sourceDir, '.gitignore');

  const ignore = await createIgnoreFilter([rootIgnoreFile, templateIgnoreFile]);

  const spinner = new Spinner();

  const destPath = pathe.relative(process.cwd(), path);

  consola.debug('destPath', destPath);

  spinner.start(`Copying ${chalk.bold(`${template}`)} template to ${chalk.bold(destPath)}...`);

  try {
    await fs.copy(sourceDir, path, {
      errorOnExist: true,
      overwrite: false,
      filter(src, dest) {
        const relative = pathe.relative(sourceDir, src);

        if (!relative) return true;

        consola.debug('filtering: ' + relative);
        consola.trace('src: ' + src);
        consola.trace('dest: ' + dest);

        spinner.suffixText = relative;

        return !ignore.ignores(relative);
      },
    });

    spinner.success(`Copied ${chalk.bold(`${template}`)} template to ${chalk.bold(destPath)}`);
  } catch (error) {
    consola.fatal(error);

    spinner.fail(
      chalk.red(`Failed to copy ${chalk.bold(`${template}`)} template to ${chalk.bold(destPath)}`),
    );

    onCancel();
  }
}
