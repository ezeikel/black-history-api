import { Context } from "../context";

enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

enum OrganizationType {
  EDUCATIONAL = "EDUCATIONAL",
  COMMITTEE = "COMMITTEE",
  NOTSPECIFIED = "NOTSPECIFIED",
}

type Location = {
  address?: Address;
  coordinates: number[];
};

type Address = {
  firstLine: string;
  secondLine?: string;
  city: string;
  country: string;
  postalCode: string;
};

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
    people?: { id: string }[];
    location?: { id: string }[];
    media?: { id: string }[];
  };
};

type CreateEventArgs = {
  event: {
    name: string;
    date: string;
  };
};

type CreateOrganizationArgs = {
  organization: {
    name: string;
    type?: OrganizationType;
    headQuarters: Location;
  };
};

const Mutations = {
  createPerson: async (
    parent: any,
    { person: { firstName, lastName, alias } }: CreatePersonArgs,
    context: Context,
  ) => {
    const contributionType = "PERSON";

    return context.prisma.person.create({
      data: {
        firstName,
        lastName,
        alias,
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: "616b996e006e15f300b9b4c7",
              },
            },
          },
        },
      },
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
    { fact: { text, sources, people, location, media } }: CreateFactArgs,
    context: Context,
  ) => {
    const contributionType = "FACT";

    return context.prisma.fact.create({
      data: {
        text,
        sources,
        people: {
          connect:
            people?.map(person => ({
              id: person.id,
            })) || [],
        },
        location: { connect: location },
        media: { connect: media },
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: "616b996e006e15f300b9b4c7",
              },
            },
          },
        },
      },
    });
  },
  createEvent: async (
    parent: any,
    { event: { name, date } }: CreateEventArgs,
    context: Context,
  ) => {
    const contributionType = "MEDIA";

    return context.prisma.event.create({
      data: {
        name,
        date,
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: "616b996e006e15f300b9b4c7",
              },
            },
          },
        },
      },
    });
  },
  createOrganization: async (
    parent: any,
    { organization: { name, type, headQuarters } }: CreateOrganizationArgs,
    context: Context,
  ) => {
    const contributionType = "ORGANIZATION";

    return context.prisma.organization.create({
      data: {
        name,
        type,
        headQuarters: {
          create: headQuarters,
        },
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: "616b996e006e15f300b9b4c7",
              },
            },
          },
        },
      },
    });
  },
};

export default Mutations;
