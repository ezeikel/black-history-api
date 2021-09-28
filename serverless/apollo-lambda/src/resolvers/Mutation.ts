import { Context } from "../context";

type CreatePersonArgs = {
  firstName: string;
  lastName: string;
};

const Mutations = {
  createPerson: async (
    parent: any,
    { firstName, lastName }: CreatePersonArgs,
    context: Context,
  ) => {
    return context.prisma.person.create({
      data: { firstName, lastName },
    });
  },
};

export default Mutations;
