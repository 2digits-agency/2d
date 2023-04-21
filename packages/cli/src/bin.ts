#!/usr/bin/env node
import yargs from 'yargs';

import { cli } from './cli';

try {
  void cli.wrap(cli.terminalWidth()).argv;
} catch (error) {
  yargs().exit(1, error as Error);
}
