/* eslint-disable no-param-reassign */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  // TODO: maybe should limit query logging to non production evironments only
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});

// log query logs to console
// eslint-disable-next-line no-console
prisma.$on("query", e => console.log(e.query));

// middleware to measure perfomance
prisma.$use(async (params, next) => {
  const before = Date.now();

  const result = await next(params);

  const after = Date.now();

  // eslint-disable-next-line no-console
  console.log(
    `Query ${params.model}.${params.action} took ${after - before}ms`,
  );

  return result;
});

export default prisma;
