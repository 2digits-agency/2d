import chalk from 'chalk';
import { consola } from 'consola';
import fs from 'fs-extra';
import ignore from 'ignore';
import ora from 'ora';
import pathe from 'pathe';

import base from '../../templates/base/package.json';
import { PKG_ROOT } from '../constants';
import { onCancel } from '../helpers';

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

  const spinner = ora({
    text: `Copying ${chalk.bold(`${template} template`)} to ${chalk.bold(path)}...`,
  }).start();

  try {
    await fs.copy(sourceDir, path, {
      filter(src, dest) {
        const relative = pathe.relative(sourceDir, src);

        consola.debug('src: ' + src, 'dest: ' + dest);

        spinner.suffixText = chalk.dim(relative);

        // return !(relative && ig.ignores(relative));
        return true;
      },
    });

    spinner.succeed(
      chalk.green(`Copied ${chalk.bold(`${template} template`)} to ${chalk.bold(path)}`),
    );
  } catch {
    spinner.fail(
      chalk.red(`Failed to copy ${chalk.bold(`${template} template`)} to ${chalk.bold(path)}`),
    );

    onCancel();
  }
}
