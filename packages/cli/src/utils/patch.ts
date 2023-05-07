import * as p from '@clack/prompts';
import * as Diff from 'diff';
import { consola } from 'consola';
import fs from 'fs-extra';
import { globby } from 'globby';
import pathe from 'pathe';

import type { Template } from '../constants';
import { TEMPLATE_DIR } from '../constants';

export function getTemplatePatches(template: Template) {
  const cwd = pathe.join(TEMPLATE_DIR, template);
  return globby('./**/*.patch', { cwd, followSymbolicLinks: false, gitignore: true });
}

export async function applyPatch(template: Template, patch: string, path: string) {
  const patchPath = pathe.join(TEMPLATE_DIR, template, patch);
  const patchContent = await fs.readFile(patchPath, { encoding: 'utf8' });
  const [patchResult] = Diff.parsePatch(patchContent);

  consola.debug('patchContent', patchContent);
  consola.debug('patchResult', patchResult);

  if (!patchResult) return;

  const target = pathe.join(path, patch.replace(/\.patch$/, ''));

  const targetContent = await fs.readFile(target, { encoding: 'utf8' });
  consola.debug('targetContent', targetContent);

  const patched = Diff.applyPatch(targetContent, patchResult);

  consola.debug('patched', patched);

  if (patched) {
    return fs.writeFile(target, patched);
  }

  if (patchResult.newFileName && patchResult.oldFileName) {
    const originalContent = await fs.readFile(pathe.join(TEMPLATE_DIR, patchResult.oldFileName), {
      encoding: 'utf8',
    });

    const tmpPatched = Diff.applyPatch(originalContent, patchResult);

    const tmpTarget = pathe.join(path, patchResult.newFileName);

    const relativeTmpTarget = pathe.relative(path, tmpTarget);
    const relativeTarget = pathe.relative(path, target);

    p.log.warn(`Could not merge ${relativeTmpTarget} and ${relativeTarget}.`);

    try {
      consola.debug('tmpPatched', tmpPatched);

      await fs.writeFile(tmpTarget, tmpPatched);

      return;
    } catch {
      p.log.error('Something went wrong while trying to write the patch to the file system.');
    }
  }
}
