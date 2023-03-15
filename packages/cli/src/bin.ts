#!/usr/bin/env node
import cli from './cli';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

function main() {
  cli.parse();
}

main();
