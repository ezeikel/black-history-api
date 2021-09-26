import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

const Query = {
  people: (_, args, ctx) => ctx.prisma.person.findMany(),
};

export default Query;