import type { ConfigExternal } from '@orval/core';
import { generateExports } from './generateExports';

const config = {
  petstore: {
    // Replace this with your own swagger file
    input: 'https://petstore.swagger.io/v2/swagger.json',
    output: {
      // Specify the output directory
      target: './src/petstore',
      mode: 'split',
      clean: true,
      prettier: true,
      // Enable to generate a mock api
      mock: true,
      override: {
        mock: {
          required: true,
          delay: 500,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: generateExports,
    },
  },
} satisfies ConfigExternal;

export default config;
