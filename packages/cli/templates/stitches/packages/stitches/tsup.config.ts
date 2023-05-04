import { defineConfig } from 'tsup';

import { name } from './package.json';

export default defineConfig({
  minify: true,
  target: 'esnext',
  skipNodeModulesBundle: true,
  sourcemap: true,
  treeshake: true,
  format: ['esm', 'cjs'],
  entry: ['src/index.ts', 'src/reset.css'],
  clean: true,
  dts: {
    entry: 'src/index.ts',
  },
  name,
});
