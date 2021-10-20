import { Context } from "../context";

const Query = {
  people: (parent: any, args: any, context: Context) =>
    context.prisma.person.findMany(),
  users: (parent: any, args: any, context: Context) =>
    context.prisma.user.findMany(),
  facts: (parent: any, args: any, context: Context) =>
    context.prisma.fact.findMany(),
  events: (parent: any, args: any, context: Context) =>
    context.prisma.event.findMany(),
  organizations: (parent: any, args: any, context: Context) =>
    context.prisma.organization.findMany({
      include: {
        headQuarters: {
          include: {
            address: true,
          },
        },
      },
    }),
};

export default Query;
