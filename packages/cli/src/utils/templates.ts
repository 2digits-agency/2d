import chalk from 'chalk';
import { createConsola } from 'consola';
import fs from 'fs-extra';
import ignore from 'ignore';
import pathe from 'pathe';

import { Spinner } from '@2digits/log';

import base from '../../public/templates/base/package.json';
import web from '../../public/templates/web/apps/web/package.json';
import { PKG_DIST } from '../constants';
import { onCancel } from '../helpers';

const consola = createConsola({ defaults: { tag: 'utils/templates' } });

export const templates = {
  base,
  web,
} as const;

export type Template = keyof typeof templates;

export async function copyTemplate(template: Template, path: string) {
  const sourceDir = pathe.join(PKG_DIST, 'templates', template);

  consola.debug('sourceDir', sourceDir);

  const ignoreFile = pathe.join(sourceDir, '.gitignore');

  consola.debug('ignoreFile', ignoreFile);

  const ig = ignore();

  if (await fs.exists(ignoreFile)) {
    const ignoreContents = await fs.readFile(ignoreFile, { encoding: 'utf8' });

    const ignoreLines = ignoreContents.split('\n').filter((line) => ignore.isPathValid(line));

    consola.debug('ignoreLines', ignoreLines);

    ig.add(ignoreLines);
  }

  const spinner = new Spinner();

  const destPath = pathe.relative(process.cwd(), path);

  consola.debug('destPath', destPath);

  spinner.start(`Copying ${chalk.bold(`${template}`)} template to ${chalk.bold(destPath)}...`);

  try {
    await fs.copy(sourceDir, path, {
      errorOnExist: true,
      filter(src, dest) {
        const relative = pathe.relative(sourceDir, src);

        consola.debug('filtering: ' + relative);
        consola.trace('src: ' + src);
        consola.trace('dest: ' + dest);

        spinner.suffixText = relative;

        return !(relative && ig.ignores(relative));
      },
    });

    spinner.success(`Copied ${chalk.bold(`${template} template`)} to ${chalk.bold(destPath)}`);
  } catch (error) {
    consola.fatal(error);

    spinner.fail(
      chalk.red(`Failed to copy ${chalk.bold(`${template} template`)} to ${chalk.bold(destPath)}`),
    );

    onCancel();
  }
}
