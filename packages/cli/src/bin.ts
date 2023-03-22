#!/usr/bin/env node
import { cli } from './cli';

void cli.wrap(cli.terminalWidth()).argv;
