import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

const Query = {
  people: () => prisma.person.findMany(),
};

export default Query;