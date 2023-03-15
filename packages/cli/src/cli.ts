import { Command } from 'commander';

import packageInfo from '../package.json';
import { init } from './commands/init';

const cli = new Command('2d')
  .description('Create and manage 2digits monorepo projects')
  .version(packageInfo.version)
  .addHelpCommand()
  .addCommand(init);

export default cli;
