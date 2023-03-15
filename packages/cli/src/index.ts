import cli from './cli';

export default function main(...args: string[]) {
  cli.parse(args, { from: 'user' });
}
