import chalk from 'chalk';
import { consola } from 'consola';
import fs from 'fs-extra';
import ignore from 'ignore';
import pathe from 'pathe';

import base from '../../templates/base/package.json';
import { PKG_ROOT } from '../constants';
import { onCancel } from '../helpers';
import { Spinner } from './log';

export const templates = {
  base,
} as const;

export type Template = keyof typeof templates;

export async function copyTemplate(template: Template, path: string) {
  const sourceDir = pathe.join(PKG_ROOT, 'templates', template);

  const ignoreFile = pathe.join(sourceDir, '.gitignore');

  const ig = ignore();

  if (await fs.exists(ignoreFile)) {
    const ignoreContents = await fs.readFile(ignoreFile, { encoding: 'utf8' });

    ig.add(ignoreContents.split('\n').filter((line) => ignore.isPathValid(line)));
  }

  const spinner = new Spinner();

  const destPath = pathe.relative(process.cwd(), path);

  spinner.start(`Copying ${chalk.bold(`${template}`)} template to ${chalk.bold(destPath)}...`);

  try {
    await fs.copy(sourceDir, path, {
      filter(src, dest) {
        const relative = pathe.relative(sourceDir, src);

        consola.debug('src: ' + src, 'dest: ' + dest);

        spinner.suffixText = relative;

        return !(relative && ig.ignores(relative));
      },
    });

    spinner.success(`Copied ${chalk.bold(`${template} template`)} to ${chalk.bold(destPath)}`);
  } catch {
    spinner.fail(
      chalk.red(`Failed to copy ${chalk.bold(`${template} template`)} to ${chalk.bold(destPath)}`),
    );

    onCancel();
  }
}
