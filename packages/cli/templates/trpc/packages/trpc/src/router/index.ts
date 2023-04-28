import { createTRPCRouter } from '../trpc';
import { helloProcedure } from './example/hello';

export const appRouter = createTRPCRouter({
  hello: helloProcedure,
});

export type AppRouter = typeof appRouter;
