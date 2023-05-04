import { fileURLToPath } from 'node:url';
import pathe from 'pathe';

import base from '../templates/base/package.json' assert { type: 'json' };
import stitches from '../templates/stitches/packages/stitches/package.json' assert { type: 'json' };
import swaggerSdk from '../templates/swagger-sdk/packages/swagger-sdk/package.json' assert { type: 'json' };
import trpc from '../templates/trpc/packages/trpc/package.json' assert { type: 'json' };
import web from '../templates/web/apps/web/package.json' assert { type: 'json' };

// With the move to TSUP as a build tool, this keeps path routes in other files (installers, loaders, etc) in check more easily.
// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url);

export const PKG_DIST = pathe.dirname(__filename);

export const PKG_ROOT = pathe.join(PKG_DIST, '..');

export const TEMPLATE_DIR = pathe.join(PKG_ROOT, 'templates');

export const templates = {
  base,
  web,
  trpc,
  stitches,
  ['swagger-sdk']: swaggerSdk,
} as const;

export type Template = keyof typeof templates;
