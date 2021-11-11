import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Context } from "../context";
import processFile from "../utils/processFile";

enum OrganizationType {
  EDUCATIONAL = "EDUCATIONAL",
  COMMITTEE = "COMMITTEE",
  NOTSPECIFIED = "NOTSPECIFIED",
}

enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

enum ContributionType {
  PERSON = "PERSON",
  MEDIA = "MEDIA",
  FACT = "FACT",
  EVENT = "EVENT",
  ORGANIZATION = "ORGANIZATION",
  MEMORIAL = "MEMORIAL",
}

type ConnectArgs = { id: string };

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

type Person = {
  firstName: string;
  lastName: string;
  alias: string;
};

type CreatePersonArgs = {
  firstName: string;
  lastName: string;
  alias: string;
};

type CreateUserArgs = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
};

type CreateFactArgs = {
  text: string;
  sources: string[];
  people?: Person[];
  existingPeople?: ConnectArgs[];
  locations?: Location[];
  existingLocations?: ConnectArgs[];
  media?: CreateMediaArgs[];
  existingMedia?: ConnectArgs[];
};

type CreateEventArgs = {
  name: string;
  date: Date;
  people?: ConnectArgs[];
  locations?: ConnectArgs[];
  media?: ConnectArgs[];
};

type CreateOrganizationArgs = {
  name: string;
  type?: OrganizationType;
  headQuarters: Location;
  website?: string;
};

type CreateMediaArgs = {
  type: MediaType;
  caption?: string;
  location?: string;
  file: any; // TODO:
};

type SignInUserArgs = {
  email: string;
  password: string;
};

const Mutations = {
  createPerson: async (
    parent: any,
    { firstName, lastName, alias }: CreatePersonArgs,
    context: Context,
  ) => {
    const {
      user: { id: userId },
    } = context;
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
                id: userId,
              },
            },
          },
        },
      },
    });
  },
  createUser: async (
    parent: any,
    { firstName, lastName, email, bio, username, password }: CreateUserArgs,
    context: Context,
  ) => {
    const lowerCaseEmail = email.toLowerCase();
    const lowerCaseUsername = username.toLowerCase();

    // TODO: Do some kind of check for taken username aswell
    const exists = await context.prisma.user.findUnique({ where: { email } });

    if (exists) {
      throw new Error(
        "email: Hmm, a user with that email already exists. Use another one or sign in.",
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user in the db
    const user = await context.prisma.user.create({
      data: {
        firstName,
        lastName,
        email: lowerCaseEmail,
        bio,
        username: lowerCaseUsername,
        password: hashedPassword,
      },
    });

    // create jwt token for user
    const token = jwt.sign(
      { userId: user.id },
      process.env.APP_SECRET as string,
    );

    // set the jwt as a cookie on the response
    context.res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });

    // finally return user
    return user;
  },
  signInUser: async (
    parent: any,
    { email, password }: SignInUserArgs,
    context: Context,
  ) => {
    // check if a user with email exists
    const user = await context.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error(
        "Hmm, we couldn't find that email in our records. Try again.",
      );
    }

    // check if the password is correct
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error(
        "Hmm, that password doesn't match the one we have on record. Try again.",
      );
    }

    // generate the jwt
    const token = jwt.sign(
      { userId: user.id },
      process.env.APP_SECRET as string,
    );

    // set cookie with the token
    context.res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },
  signOutUser: (parent: any, args: {}, context: Context) => {
    context.res.clearCookie("token");

    return { message: "Goodbye!" };
  },
  createFact: async (
    parent: any,
    {
      text,
      sources,
      people,
      existingPeople,
      locations,
      existingLocations,
      media,
      existingMedia,
    }: CreateFactArgs,
    context: Context,
  ) => {
    const {
      user: { id: userId },
    } = context;
    const contributionType = "FACT";
    let processedMedia;

    if (media) {
      const tags = ["contributed_media"];

      processedMedia = await Promise.all(
        media.map(async singleMedia => {
          const { url, publicId } = await processFile({
            file: singleMedia.file,
            tags,
          });
          const { type, caption } = singleMedia;

          return {
            type,
            caption,
            url,
            publicId,
          };
        }),
      );
    }

    // FYI: using connect for related array fields because connectOrCreate doesnt support multiple connects/creations - https://github.com/prisma/prisma/issues/5100
    // this means any array of related Models will have to be created beforehand by front end and their ids passed to this resolver
    // TODO: solution for above here - https://github.com/prisma/prisma/discussions/8851

    return context.prisma.fact.create({
      data: {
        text,
        sources,
        people: {
          connect:
            existingPeople?.map(person => ({
              id: person.id,
            })) || [],
          create:
            people?.map(person => ({
              ...person,
              contribution: {
                create: {
                  type: "PERSON" as ContributionType, // TODO: why do i need to cast this?
                  user: {
                    connect: {
                      id: userId,
                    },
                  },
                },
              },
            })) || [],
        },
        locations: {
          connect:
            existingLocations?.map(location => ({
              id: location.id,
            })) || [],
          create: locations,
        },
        media: {
          connect:
            existingMedia?.map(singleMedia => ({
              id: singleMedia.id,
            })) || [],
          create:
            processedMedia?.map(singleProcessedMedia => ({
              ...singleProcessedMedia,
              contribution: {
                create: {
                  type: "MEDIA" as ContributionType, // TODO: why do i need to cast this?
                  user: {
                    connect: {
                      id: userId,
                    },
                  },
                },
              },
            })) || [],
        },
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
      },
    });
  },
  createEvent: async (
    parent: any,
    { name, date, people, locations, media }: CreateEventArgs,
    context: Context,
  ) => {
    const {
      user: { id: userId },
    } = context;
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
                id: userId,
              },
            },
          },
        },
      },
    });
  },
  createOrganization: async (
    parent: any,
    { name, type, headQuarters, website }: CreateOrganizationArgs,
    context: Context,
  ) => {
    const {
      user: { id: userId },
    } = context;
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
                id: userId,
              },
            },
          },
        },
      },
    });
  },
  createMedia: async (
    parent: any,
    { type, caption, file }: CreateMediaArgs,
    context: Context,
  ) => {
    const {
      user: { id: userId },
    } = context;

    const contributionType = "MEDIA";
    const tags = ["contributed_media"];

    const { url, publicId } = await processFile({
      file,
      tags,
    });

    return context.prisma.media.create({
      data: {
        type,
        caption,
        publicId,
        url,
        // location: {
        //   connect: {
        //     id: location,
        //   },
        // },
        contribution: {
          create: {
            type: contributionType,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
      },
    });
  },
};

export default Mutations;
