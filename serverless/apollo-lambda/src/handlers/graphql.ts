import { ApolloServer, gql } from "apollo-server-lambda";
import * as Sentry from "@sentry/serverless";
import Query from "../resolvers/Query";
import Mutation from "../resolvers/Mutation";
import { createContext } from "../context";

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const typeDefs = gql`
  type Person {
    id: String!
    firstName: String
    lastName: String
    alias: String
  }
  type User {
    id: String!
    firstName: String!
    lastName: String!
    email: String!
    profilePicture: String
    role: String!
    bio: String
    gender: String!
  }
  type Query {
    people: [Person]
    users: [User]
  }
  type Mutation {
    createPerson(firstName: String, lastName: String, alias: String): Person!
    createUser(
      firstName: String!
      lastName: String!
      email: String!
      profilePicture: String
      bio: String
      role: String
    ): User!
  }
`;

const resolvers = {
  Query,
  Mutation,
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ event }) => ({
    headers: event.headers,
    ...createContext(),
  }),
});

export const handler = Sentry.AWSLambda.wrapHandler(server.createHandler());
