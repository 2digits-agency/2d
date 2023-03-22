import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { init } from './commands/init';

export const cli = yargs(hideBin(process.argv))
  .scriptName('2d')
  .command(init)
  .demandCommand()
  .completion()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .help()
  .wrap(yargs.terminalWidth());
