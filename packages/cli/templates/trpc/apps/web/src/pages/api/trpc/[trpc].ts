import { createNextApiHandler } from '@trpc/server/adapters/next';

import { appRouter } from '@mod/trpc';

export default createNextApiHandler({
  router: appRouter,
  createContext(options) {
    return options;
  },
});
