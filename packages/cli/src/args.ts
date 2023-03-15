import yargs from 'yargs';

export const argsParser = yargs
  .command('init', 'Initialize a new project.', (args) => {
    return args.positional('dir', { type: 'string' });
  })
  .help()
  .strict()
  .parse();
