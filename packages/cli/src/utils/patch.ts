import * as Diff from 'diff';
import { consola } from 'consola';
import fs from 'fs-extra';
import { globby } from 'globby';
import pathe from 'pathe';

import { TEMPLATE_DIR } from '../constants';
import type { Template } from './templates';

export function getTemplatePatches(template: Template) {
  const cwd = pathe.join(TEMPLATE_DIR, template);
  return globby('./**/*.patch', { cwd, followSymbolicLinks: false });
}

export async function applyPatch(template: Template, patch: string, path: string) {
  const patchPath = pathe.join(TEMPLATE_DIR, template, patch);
  const patchContent = await fs.readFile(patchPath, { encoding: 'utf8' });
  consola.debug('patchContent', patchContent);

  const target = pathe.join(path, patch.replace(/\.patch$/, ''));

  const targetContent = await fs.readFile(target, { encoding: 'utf8' });
  consola.debug('targetContent', targetContent);

  const patched = Diff.applyPatch(targetContent, patchContent);

  consola.debug('patched', patched);

  await fs.writeFile(target, patched);
}
