import consola from 'consola';
import fs from 'fs-extra';
import type { Ignore } from 'ignore';
import ignore from 'ignore';

async function readIgnoreFile(ignoreFilePath: string): Promise<string[] | undefined> {
  if (!(await fs.pathExists(ignoreFilePath))) return;

  const contents = await fs.readFile(ignoreFilePath, { encoding: 'utf8' });

  return contents.split('\n');
}

function parseIgnoreLines(ignoreContents: string[]): string[] {
  const parsedLines: string[] = [];

  for (const ignoreLine of ignoreContents) {
    const trimmed = ignoreLine.trim();

    if (ignore.isPathValid(trimmed) && !trimmed.startsWith('#')) {
      parsedLines.push(trimmed);
    }
  }

  return parsedLines;
}

export async function createIgnoreFilter(ignoreFilePaths: string[]): Promise<Ignore> {
  const parsedIgnoreLines: string[][] = [];

  for (const ignoreFilePath of ignoreFilePaths) {
    consola.debug('ignoreFilePath', ignoreFilePath);

    const ignoreContents = await readIgnoreFile(ignoreFilePath);

    if (!ignoreContents) {
      consola.debug('No file found at ' + ignoreFilePath);

      continue;
    }

    const ignoreLines = parseIgnoreLines(ignoreContents);

    consola.debug('ignoreLines', ignoreLines);

    parsedIgnoreLines.push(ignoreLines);
  }

  const ignoreSet = new Set(parsedIgnoreLines.flat());

  consola.debug('ignoreSet', ignoreSet);

  return ignore().add([...ignoreSet]);
}
