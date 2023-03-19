import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const cli = yargs(hideBin(process.argv))
  .scriptName('2d')
  .command('init', 'Initialize a new project', (args) => {
    return args.positional('path', {
      type: 'string',
      describe: 'where to create the project',
      normalize: true,
    });
  })
  // .command('* [mode]', 'Keeps your deps fresh', (args) => {
  //   return args
  //     .positional('mode', {
  //       default: 'default',
  //       type: 'string',
  //       describe:
  //         'the mode how version range resolves, can be "default", "major", "minor", "latest" or "newest"',
  //       choices: ['default', 'major', 'minor', 'patch', 'latest', 'newest'],
  //     })
  //     .option('write', {
  //       alias: 'w',
  //       default: false,
  //       type: 'boolean',
  //       describe: 'write to package.json',
  //     })
  //     .option('interactive', {
  //       alias: 'I',
  //       default: false, // TODO: enable by default: !process.env.CI && process.stdout.isTTY,
  //       type: 'boolean',
  //       describe: 'interactive mode',
  //     })
  //     .option('install', {
  //       alias: 'i',
  //       default: false,
  //       type: 'boolean',
  //       describe: 'install directly after bumping',
  //     })
  //     .option('update', {
  //       alias: 'u',
  //       default: false,
  //       type: 'boolean',
  //       describe: 'update directly after bumping',
  //     })
  //     .option('all', {
  //       alias: 'a',
  //       default: false,
  //       type: 'boolean',
  //       describe: 'show all packages up to date info',
  //     })
  //     .help();
  // })
  .demandCommand()
  .strict()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .help();
