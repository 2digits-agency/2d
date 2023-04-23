import { fileURLToPath } from 'node:url';
import pathe from 'pathe';

// With the move to TSUP as a build tool, this keeps path routes in other files (installers, loaders, etc) in check more easily.
// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url);

export const PKG_DIST = pathe.dirname(__filename);

export const TEMPLATE_DIR = pathe.join(PKG_DIST, 'templates');
