import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

export type Context = {
  prisma: PrismaClient;
};

export const createContext = (): Context => ({ prisma });
