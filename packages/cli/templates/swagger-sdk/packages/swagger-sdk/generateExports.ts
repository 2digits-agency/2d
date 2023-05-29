import { readdir, writeFile } from 'node:fs/promises';

import consola from 'consola';
import { genExport } from 'knitwork';
import path from 'pathe';
import Prettier from 'prettier';

const logger = consola.withTag('orval');

logger.wrapAll();

export async function generateExports() {
  const exports: string[] = [];

  const src = path.normalize('./src');

  logger.info('Generating exports in', src);

  const contents = await readdir(src, { withFileTypes: true });

  logger.withTag('contents').debug(contents);

  const entries = contents.filter((item) => item.isDirectory());

  logger.withTag('entries').debug(entries);

  for (const entry of entries) {
    const entryLogger = logger.withTag('entries').withTag(entry.name);
    entryLogger.info('Generating exports for', entry.name);

    const entryPath = path.join(src, entry.name);

    const entryFiles = await readdir(entryPath, { withFileTypes: true });

    entryLogger.debug(entryFiles);

    for (const file of entryFiles) {
      const exportLogger = entryLogger.withTag(file.name);

      exportLogger.debug('Checking', file.name);

      if (file.isFile()) {
        const extension = path.extname(file.name);
        exportLogger.debug('Extension:', extension);

        const baseName = path.basename(file.name, extension);
        exportLogger.debug('Base name:', baseName);

        const filePath = `./${path.relative(src, path.join(entryPath, baseName))}`;
        exportLogger.debug('Relative path:', filePath);

        const exportStatement = genExport(filePath, { name: '*' });
        exportLogger.debug('Generated export:', exportStatement);

        exports.push(exportStatement);
      }
    }

    exports.push('\n');
  }

  logger.debug('Generated exports:', exports);

  const filepath = path.join(src, 'index.ts');

  try {
    const fileContents = Prettier.format(exports.join('\n'), {
      filepath,
      parser: 'typescript',
      singleQuote: true,
    });

    await writeFile(filepath, fileContents);

    logger.success('Wrote exports to', filepath);
  } catch (error) {
    logger.error('Failed to write exports to', filepath);
    if (error instanceof Error) {
      logger.fatal(error);
    }

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}
