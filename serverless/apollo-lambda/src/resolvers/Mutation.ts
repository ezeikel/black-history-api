import { Context } from "../context";

enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

type CreatePersonArgs = {
  firstName: string;
  lastName: string;
  alias: string;
};

type CreateUserArgs = {
  firstName: string;
  lastName: string;
  email: string;
  role?: Role;
  bio?: string;
};

const Mutations = {
  createPerson: async (
    parent: any,
    { firstName, lastName, alias }: CreatePersonArgs,
    context: Context,
  ) => {
    return context.prisma.person.create({
      data: { firstName, lastName, alias },
    });
  },
  createUser: async (
    parent: any,
    { firstName, lastName, email, bio, role }: CreateUserArgs,
    context: Context,
  ) => {
    return context.prisma.user.create({
      data: { firstName, lastName, email, bio, role },
    });
  },
};

export default Mutations;
