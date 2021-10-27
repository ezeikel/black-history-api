import { Context } from "../context";
import processUpload from "../utils/processUpload";

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
    locations?: { id: string }[];
    media?: { id: string }[];
  };
};

type CreateEventArgs = {
  event: {
    name: string;
    date: Date;
    people?: { id: string }[];
    locations?: { id: string }[];
    media?: { id: string }[];
  };
};

type CreateOrganizationArgs = {
  organization: {
    name: string;
    type?: OrganizationType;
    headQuarters: Location;
    website?: string;
  };
};

type CreateMediaArgs = {
  media: {
    type: "IMAGE" | "VIDEO";
    caption?: string;
    location?: string;
    file: any; // TODO:
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
    { fact: { text, sources, people, locations, media } }: CreateFactArgs,
    context: Context,
  ) => {
    const contributionType = "FACT";

    // FYI: using connect for related array fields because connectOrCreate doesnt support multiple connects/creations - https://github.com/prisma/prisma/issues/5100
    // this means any array of related Models will have to be created beforehand by front end and their ids passed to this resolver

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
        locations: {
          connect:
            locations?.map(location => ({
              id: location.id,
            })) || [],
        },
        media: {
          connect:
            media?.map(singleMedia => ({
              id: singleMedia.id,
            })) || [],
        },
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: "616b996e006e15f300b9b4c7", // TODO: replace with req.user
              },
            },
          },
        },
      },
    });
  },
  createEvent: async (
    parent: any,
    { event: { name, date, people, locations, media } }: CreateEventArgs,
    context: Context,
  ) => {
    const contributionType = "EVENT";

    return context.prisma.event.create({
      data: {
        name,
        date,
        people: {
          connect:
            people?.map(person => ({
              id: person.id,
            })) || [],
        },
        locations: {
          connect:
            locations?.map(location => ({
              id: location.id,
            })) || [],
        },
        media: {
          connect:
            media?.map(singleMedia => ({
              id: singleMedia.id,
            })) || [],
        },
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: "616b996e006e15f300b9b4c7", // TODO: replace with req.user
              },
            },
          },
        },
      },
    });
  },
  createOrganization: async (
    parent: any,
    {
      organization: { name, type, headQuarters, website },
    }: CreateOrganizationArgs,
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
        website,
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: "616b996e006e15f300b9b4c7", // TODO: replace with req.user
              },
            },
          },
        },
      },
    });
  },
  createMedia: async (
    parent: any,
    { media: { type, caption, location, file } }: CreateMediaArgs,
    context: Context,
  ) => {
    let fileType;
    const contributionType = "MEDIA";
    const { createReadStream, mimetype } = await file;

    switch (mimetype) {
      case "image/png":
      case "image/jpg":
      case "image/jpeg":
      case "image/heic":
        fileType = "image";
        break;
      case "video/mp4":
      case "video/quicktime":
        fileType = "video";
        break;
      default:
        fileType = "image";
        break;
    }

    const tags = ["contributed_media"];
    const folder = `uploads/media/${fileType}s`;
    const { resultSecureUrl, publicId } = await processUpload({
      file: { createReadStream, fileType },
      tags,
      folder,
    });

    return context.prisma.media.create({
      data: {
        type,
        caption,
        publicId,
        url: resultSecureUrl,
        location: {
          connect: {
            id: location,
          },
        },
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: "616b996e006e15f300b9b4c7", // TODO: replace with req.user
              },
            },
          },
        },
      },
    });
  },
};

export default Mutations;
