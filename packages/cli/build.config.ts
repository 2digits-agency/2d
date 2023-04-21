import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/bin'],
  clean: true,
  declaration: true,
  rollup: {
    inlineDependencies: false,
  },
});
