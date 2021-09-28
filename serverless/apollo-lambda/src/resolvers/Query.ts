import { Context } from "../context";

const Query = {
  people: (parent: any, args: any, context: Context) =>
    context.prisma.person.findMany(),
};

export default Query;
