import chalk from 'chalk';
import { execa } from 'execa';

import { Spinner } from './log';

export async function installDependencies(path: string) {
  const spinner = new Spinner();

  spinner.start(`Installing dependencies...`);

  try {
    await execa('pnpm', ['install'], { cwd: path });

    spinner.success(`Installed dependencies`);
  } catch {
    spinner.fail(chalk.red(`Failed to install dependencies`));
  }
}
