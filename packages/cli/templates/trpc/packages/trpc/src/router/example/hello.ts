import { z } from 'zod';

import { publicProcedure } from '../../trpc';

export const helloProcedure = publicProcedure
  .input(z.object({ name: z.string() }))
  .query(({ input }) => `Hello ${input.name}!`);
