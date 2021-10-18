import { Context } from "../context";

enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

type CreatePersonArgs = {
  person: {
    firstName: string;
    lastName: string;
    alias: string;
  };
};

type CreateUserArgs = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role?: Role;
    bio?: string;
  };
};

type CreateFactArgs = {
  fact: {
    text: string;
    sources: string[];
    // people?: { firstName: string; lastName: string; alias: string }[];
    // location?: { name: string; address: string }[];
    // media?: {
    //   type: string;
    //   caption: string;
    //   url: string;
    //   publicId: string;
    //   location: {
    //     name: string;
    //     address: {
    //       firstLine: string;
    //       secondLine: string;
    //       city: string;
    //       country: string;
    //       postalCode: string;
    //     };
    //     coordinates: { latitude: string; longitute: string }[];
    //   };
    // }[];
  };
};

const Mutations = {
  createPerson: async (
    parent: any,
    { person: { firstName, lastName, alias } }: CreatePersonArgs,
    context: Context,
  ) => {
    return context.prisma.person.create({
      data: { firstName, lastName, alias },
    });
  },
  createUser: async (
    parent: any,
    { user: { firstName, lastName, email, bio, role } }: CreateUserArgs,
    context: Context,
  ) => {
    return context.prisma.user.create({
      data: { firstName, lastName, email, bio, role },
    });
  },
  createFact: async (
    parent: any,
    { fact: { text, sources } }: CreateFactArgs,
    context: Context,
  ) => {
    return context.prisma.fact.create({
      data: {
        text,
        sources,
        // people: { create: people },
        // location: { create: location },
        // media: { create: media },
      },
    });
  },
};

export default Mutations;
