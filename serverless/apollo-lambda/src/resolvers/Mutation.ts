import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Context } from "../context";
import processUpload from "../utils/processUpload";

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
    username: string;
    email: string;
    password: string;
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

type SignInUserArgs = {
  email: string;
  password: string;
};

const Mutations = {
  createPerson: async (
    parent: any,
    { person: { firstName, lastName, alias } }: CreatePersonArgs,
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
    {
      user: { firstName, lastName, email, bio, username, password },
    }: CreateUserArgs,
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
    { fact: { text, sources, people, locations, media } }: CreateFactArgs,
    context: Context,
  ) => {
    const {
      user: { id: userId },
    } = context;
    const contributionType = "FACT";

    // FYI: using connect for related array fields because connectOrCreate doesnt support multiple connects/creations - https://github.com/prisma/prisma/issues/5100
    // this means any array of related Models will have to be created beforehand by front end and their ids passed to this resolver
    // TODO: solution for above here - https://github.com/prisma/prisma/discussions/8851

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
    { event: { name, date, people, locations, media } }: CreateEventArgs,
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
    {
      organization: { name, type, headQuarters, website },
    }: CreateOrganizationArgs,
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
    { media: { type, caption, file } }: CreateMediaArgs,
    context: Context,
  ) => {
    const {
      user: { id: userId },
    } = context;
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
