import p from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
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
  const spinner = p.spinner();

  spinner.start(`Copying ${chalk.bold(`${template} template`)} to ${chalk.bold(path)}...`);

  try {
    await fs.copy(sourceDir, path);

    spinner.stop(
      chalk.green(`Copied ${chalk.bold(`${template} template`)} to ${chalk.bold(path)}`),
    );
  } catch {
    spinner.stop(
      chalk.red(`Failed to copy ${chalk.bold(`${template} template`)} to ${chalk.bold(path)}`),
    );

    onCancel();
  }
}
