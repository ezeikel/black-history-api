import { Context } from "../context";

const Query = {
  people: (parent: any, args: any, context: Context) =>
    context.prisma.person.findMany(),
  users: (parent: any, args: any, context: Context) =>
    context.prisma.user.findMany(),
  facts: (parent: any, args: any, context: Context) =>
    context.prisma.fact.findMany({
      include: {
        people: true,
      },
    }),
  events: (parent: any, args: any, context: Context) =>
    context.prisma.event.findMany(),
  organizations: (parent: any, args: any, context: Context) =>
    context.prisma.organization.findMany({
      include: {
        headQuarters: true,
      },
    }),
  contributions: (parent: any, args: any, context: Context) =>
    context.prisma.contribution.findMany({
      include: {
        user: true,
      },
    }),
  media: (parent: any, args: any, context: Context) =>
    context.prisma.media.findMany({
      include: {
        location: true,
        // TODO: more related fields?
      },
    }),
};

export default Query;
