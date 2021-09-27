const Query = {
  people: (_, args, ctx) => ctx.prisma.person.findMany(),
};

export default Query;
