import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import pkg from '../package.json';
import { create } from './commands/create';
import { init } from './commands/init';

export const cli = yargs(hideBin(process.argv))
  .scriptName('2d')
  .command(init)
  .command(create)
  .demandCommand()
  .completion()
  .alias('h', 'help')
  .version(pkg.version)
  .alias('v', 'version')
  .help();
