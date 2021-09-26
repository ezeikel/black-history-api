const Mutations = {
  createPerson: async (_, { firstName, lastName }, ctx, info) => {

  return ctx.prisma.person.create({
    data: { firstName, lastName },
  });
  
  },
};

export default Mutations;