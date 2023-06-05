import { fileURLToPath } from 'node:url';

import pathe from 'pathe';

import base from '../templates/base/package.json';
import gqlCodegen from '../templates/gql-codegen/packages/gql-codegen/package.json';
import module from '../templates/module/package.json';
import storybook from '../templates/storybook/apps/storybook/package.json';
import swaggerSdk from '../templates/swagger-sdk/packages/swagger-sdk/package.json';
import tailwind from '../templates/tailwind/packages/tailwind/package.json';
import trpc from '../templates/trpc/packages/trpc/package.json';
import web from '../templates/web/apps/web/package.json';

// With the move to TSUP as a build tool, this keeps path routes in other files (installers, loaders, etc) in check more easily.
// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url);

export const PKG_DIST = pathe.dirname(__filename);

export const PKG_ROOT = pathe.join(PKG_DIST, '..');

export const TEMPLATE_DIR = pathe.join(PKG_ROOT, 'templates');

export const templates = {
  base,
  web,
  tailwind,
  trpc,
  ['swagger-sdk']: swaggerSdk,
  storybook,
  ['gql-codegen']: gqlCodegen,
  module,
} as const;

export type Template = keyof typeof templates;
