import * as p from '@clack/prompts';
import chalk from 'chalk';

import { createCommand } from '../helpers';
import { moduleEnum } from '../schemas';

export const add = createCommand(['add [module]', 'a'], {
  describe: 'Add a module to an existing project',
  builder(args) {
    return args.positional('module', {
      describe: 'Module to add',
      choices: moduleEnum.options,
      type: 'string',
      alias: 'm',
    });
  },
  handler(args) {
    p.intro(chalk.bgHex('#762BFF').hex('#FFFFFF').bold(' 2d add '));

    p.note(JSON.stringify(args, undefined, 2), 'Arguments');
  },
});
