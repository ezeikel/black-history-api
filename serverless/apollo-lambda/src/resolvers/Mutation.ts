import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

const Mutations = {
  createPerson: async (_, { firstName, lastName }, ctx, info) => {

  return prisma.person.create({
    data: { firstName, lastName },
  });
  
  },
};

export default Mutations;