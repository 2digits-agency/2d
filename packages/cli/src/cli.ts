/* eslint-disable @typescript-eslint/no-floating-promises */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export default yargs(hideBin(process.argv))
  .scriptName('taze')
  .usage('$0 [args]')
  .command('usage', 'List dependencies versions usage across packages', (args) => {
    return args
      .option('detail', {
        alias: 'a',
        type: 'boolean',
        default: false,
        describe: 'show more info',
      })
      .help()
      .demandOption('recursive', 'Please add -r to analysis usages');
  })
  .command(
    '* [mode]',
    'Keeps your deps fresh',
    (args) => {
      return args
        .positional('mode', {
          default: 'default',
          type: 'string',
          describe:
            'the mode how version range resolves, can be "default", "major", "minor", "latest" or "newest"',
          choices: ['default', 'major', 'minor', 'patch', 'latest', 'newest'],
        })
        .option('write', {
          alias: 'w',
          default: false,
          type: 'boolean',
          describe: 'write to package.json',
        })
        .option('interactive', {
          alias: 'I',
          default: false, // TODO: enable by default: !process.env.CI && process.stdout.isTTY,
          type: 'boolean',
          describe: 'interactive mode',
        })
        .option('install', {
          alias: 'i',
          default: false,
          type: 'boolean',
          describe: 'install directly after bumping',
        })
        .option('update', {
          alias: 'u',
          default: false,
          type: 'boolean',
          describe: 'update directly after bumping',
        })
        .option('all', {
          alias: 'a',
          default: false,
          type: 'boolean',
          describe: 'show all packages up to date info',
        })
        .help();
    },
    console.log,
  )
  .showHelpOnFail(false)
  .alias('h', 'help')
  .version('0.0.0')
  .alias('v', 'version')
  .help().argv;
