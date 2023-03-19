import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/bin'],
  rollup: {
    inlineDependencies: true,
  },
  clean: true,
  declaration: true,
});
