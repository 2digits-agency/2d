import { Command } from 'commander';
import { normalize } from 'node:path';

export const init = new Command('init')
  .description('initialize a new project')
  .argument('[directory]', 'directory for the project', (dir) => {
    return normalize(dir);
  })
  .action((args) => {
    console.log('hello from init', args);
  });
