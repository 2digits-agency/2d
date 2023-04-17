import p from '@clack/prompts';
import type { Argv } from 'yargs';
import type { ArgumentsCamelCase as Args, CommandModule } from 'yargs';
import type { z } from 'zod';

export type Simplify<TType> = { [KeyType in keyof TType]: TType[KeyType] } & unknown;

/**
 * Represents the options for a command.
 */
export interface CommandOptions<TCmd> {
  /** The description of the command or `false` if not described. */
  describe: string | false;
  /** The handler function to be called with the parsed arguments. */
  handler(args: Args<Simplify<TCmd>>): void | Promise<void>;
  /** An optional builder function to define command-specific arguments. */
  builder?: ((args: Argv) => Argv<TCmd>) | ((args: Argv) => Promise<Argv<TCmd>>);
  /** An optional flag or message to indicate if the command is deprecated. */
  deprecated?: boolean | string;
}

/**
 * Represents a command with its options.
 */
export interface Command<TCmd> extends CommandOptions<TCmd> {
  /** The command name or an array of command names. */
  command: string | readonly string[];
  handler(args: unknown): void | Promise<void>;
}

/**
 * Creates a command module with the specified command name(s) and options.
 * @param command - A string or an array of strings representing the command name(s).
 * @param options - An object containing the command options.
 * @returns A command module.
 */
export function createCommand<TCmd>(
  command: string | readonly string[],
  options: CommandOptions<TCmd>,
): Command<Simplify<TCmd>> {
  return {
    command,
    ...options,
  } satisfies CommandModule<unknown, TCmd>;
}

export async function checkCancel<TValue>(
  value: TValue | Promise<TValue>,
): Promise<Exclude<TValue, symbol>> {
  const result = await value;
  if (p.isCancel(result)) onCancel();

  return result as Exclude<TValue, symbol>;
}

export function onCancel() {
  p.cancel('Operation cancelled.');

  // eslint-disable-next-line unicorn/no-process-exit
  return process.exit(0);
}

export function validate<TValue>(validator: z.ZodType<TValue>) {
  return function (value: TValue) {
    const result = validator.safeParse(value);

    return result.success ? undefined : result.error.flatten().formErrors.join('\n');
  };
}

type Prompt<TOpts, TArg> = (opts: TOpts) => Promise<TArg | symbol>;

export async function promptMissingArg<TArg, TOpts>(
  arg: TArg | undefined | null,
  prompt: Prompt<TOpts, TArg>,
  options: TOpts,
) {
  if (arg != undefined) return arg;

  return checkCancel(prompt(options));
}
