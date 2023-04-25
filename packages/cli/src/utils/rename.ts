import { consola } from 'consola';
import fs from 'fs-extra';
import { globby } from 'globby';

export async function findPlaceholders(path: string): Promise<string[]> {
  const placeholders = await globby(['**/*_2d_**'], {
    cwd: path,
    absolute: true,
    dot: true,
  });

  consola.debug(`Found ${placeholders.length} placeholders:`);
  consola.debug(placeholders);

  return placeholders;
}

export function renameFile(placeholderPath: string): Promise<void> {
  const newPath = placeholderPath.replace(/_2d_/g, '');

  const renamed = fs.rename(placeholderPath, newPath);

  consola.debug(`Renamed ${placeholderPath} to ${newPath}`);

  return renamed;
}

export async function renamePlaceholders(path: string): Promise<void> {
  const placeholderPaths = await findPlaceholders(path);

  const renamePromises = [];

  for (const placeholderPath of placeholderPaths) {
    renamePromises.push(renameFile(placeholderPath));
  }

  await Promise.all(renamePromises);
}
