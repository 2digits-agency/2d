import { cli } from './cli';

export function main(...args: string[]) {
  return cli.parse(args, { from: 'user' });
}
