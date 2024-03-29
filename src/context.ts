import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma";

export type Context = {
  prisma: PrismaClient;
  res: any; // TODO: fix any
  user: any; // TODO: fix any
};

const getUser = async (token: string) => {
  if (!token) return null;

  // decode the jwt and get the userId
  const { userId } = <{ userId: string }>(
    jwt.verify(token, process.env.APP_SECRET as string)
  );

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      role: user.role,
    };
  } catch (error) {
    return console.error({ error });
  }
};

export const createContext = async ({ req }: any): Promise<Context> => {
  const { token } = req.cookies;
  const user = await getUser(token);

  return { prisma, res: req.res, user };
};
