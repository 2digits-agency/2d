import type { CodegenConfig } from '@graphql-codegen/cli';
import { fileURLToPath } from 'node:url';

import { projects } from './.graphqlrc.json';
import { dirname, join } from 'pathe';

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(__filename);

const config = {
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/swapi/': {
      schema: projects.swapi.schema,
      documents: join(ROOT, './apps/web/src/**/*.{gql,ts,tsx,graphql}'),
      preset: 'client-preset',
      config: {
        documentMode: 'string',
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
} satisfies CodegenConfig;

console.log(config.generates['./src/swapi/'].documents);

export default config;
