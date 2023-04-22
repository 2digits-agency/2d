import chalk from 'chalk';
import { createConsola } from 'consola';
import { execa } from 'execa';

import { Spinner } from '@2digits/log';

const consola = createConsola({ defaults: { tag: 'utils/dependencies' } });

export async function installDependencies(path: string) {
  const spinner = new Spinner();

  spinner.start(`Installing dependencies...`);

  try {
    const { command, stdout, stderr } = await execa('pnpm', ['install'], { cwd: path });

    consola.debug('command:', command);
    consola.debug('stdout:', stdout);
    consola.debug('stderr:', stderr);

    spinner.success(`Installed dependencies`);
  } catch (error) {
    consola.fatal(error);

    spinner.fail(chalk.red(`Failed to install dependencies`));
  }
}
