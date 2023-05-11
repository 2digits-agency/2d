import chalk from 'chalk';
import { createCommand, promptMissingArg, validate } from '../helpers';
import pathe from 'pathe';
import * as p from '@clack/prompts';
import { consola } from 'consola';
import { appName, appPath } from '../schemas';

export const create = createCommand('create [path]', {
  describe: 'Create a new module',
  builder(args) {
    return args
      .positional('path', {
        type: 'string',
        describe: 'Where to create the project',
        normalize: true,
      })
      .option('name', {
        type: 'string',
        describe: 'Name of the project',
        alias: 'n',
      });
  },
  async handler(args) {
    p.intro(chalk.bgHex('#762BFF').hex('#FFFFFF').bold(' 2d create '));

    const pathInput = await promptMissingArg({
      args,
      argName: 'path',
      schema: appPath,
      prompt() {
        return p.text({
          message: 'Where to create the module (relative to the project)',
          initialValue: 'packages/',
          validate: validate(appPath),
        });
      },
    });

    const path = pathe.resolve(pathInput);

    const name = await promptMissingArg({
      args,
      argName: 'name',
      schema: appName,
      prompt() {
        return p.text({
          message: 'What is the name of the project',
          validate: validate(appName),
          initialValue: pathe.basename(path),
        });
      },
    });

    args.name && p.log.info(`Creating module ${args.name}...`);

    consola.debug(args);
  },
});
