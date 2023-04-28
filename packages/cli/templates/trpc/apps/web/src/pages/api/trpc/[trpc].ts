import { appRouter } from '@mod/trpc';
import { createNextApiHandler } from '@trpc/server/adapters/next';

export default createNextApiHandler({
  router: appRouter,
  createContext(options) {
    return options;
  },
});
