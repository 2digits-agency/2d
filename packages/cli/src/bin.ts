#!/usr/bin/env node
import { Command } from 'commander';

import { argsParser } from './args';

export const a = new Command().name('2d');

export default async function main() {
  const {} = await argsParser;
}
