import { consola } from 'consola';
import fs from 'fs-extra';
import { globbyStream } from 'globby';

export async function renamePlaceholders(path: string) {
  const placeholders = globbyStream(['**/_2d_**'], {
    cwd: path,
    absolute: true,
  });

  for await (const placeholder of placeholders) {
    const renamed = placeholder.toString().replace(/_2d_/g, '');
    consola.info(placeholder, renamed);

    await fs.rename(placeholder, renamed);
  }
}
