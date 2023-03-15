import { defineConfig } from 'tsup';

import { name } from './package.json';

export default defineConfig({
  minify: true,
  target: 'esnext',
  sourcemap: true,
  treeshake: true,
  format: ['esm', 'cjs'],
  entry: ['./src/index.ts', './src/bin.ts'],
  clean: true,
  dts: false,
  name,
  onSuccess: 'node ./dist/bin.js init',
});
