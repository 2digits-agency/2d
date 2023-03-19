import { cli } from './cli';

export default function main(...args: string[]) {
  return cli.parse(args, { from: 'user' });
}
