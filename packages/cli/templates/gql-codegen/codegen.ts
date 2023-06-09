import { fileURLToPath } from 'node:url';

import type { CodegenConfig } from '@graphql-codegen/cli';
import { dirname, join } from 'pathe';

import { projects } from './.graphqlrc.json';

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(__filename);

const config = {
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/gql/': {
      schema: projects.swapi.schema,
      documents: join(ROOT, './apps/web/src/**/*.{gql,ts,tsx,graphql}'),
      preset: 'client-preset',
      config: {
        defaultScalarType: 'unknown',
        enumsAsTypes: true,
        useTypeImports: true,
        dedupeFragments: true,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
} satisfies CodegenConfig;

export default config;
