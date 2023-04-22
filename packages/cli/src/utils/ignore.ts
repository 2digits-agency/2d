import consola from 'consola';
import fs from 'fs-extra';
import ignore from 'ignore';

export async function createIgnoreFilter(ignoreFilePaths: string[]) {
  const ig = ignore();

  for (const ignoreFilePath of ignoreFilePaths) {
    try {
      consola.debug('ignoreFilePath', ignoreFilePath);

      if (await fs.exists(ignoreFilePath)) {
        const ignoreContents = await fs.readFile(ignoreFilePath, { encoding: 'utf8' });

        const ignoreLines = ignoreContents.split('\n').filter((line) => ignore.isPathValid(line));

        consola.debug('ignoreLines', ignoreLines);

        ig.add(ignoreLines);
      }
    } catch (error) {
      consola.error(error);
    }
  }

  return ig;
}
