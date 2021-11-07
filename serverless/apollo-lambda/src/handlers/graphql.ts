import { ApolloServer, gql } from "apollo-server-lambda";
import express from "express";
import { GraphQLScalarType, Kind } from "graphql";
import { GraphQLUpload, graphqlUploadExpress } from "graphql-upload";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/serverless";
import Query from "../resolvers/Query";
import Mutation from "../resolvers/Mutation";
import { createContext } from "../context";

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const typeDefs = gql`
  scalar Date
  scalar Upload

  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    username: String!
    password: String!
    profilePicture: String
    bio: String
  }

  input PersonInput {
    firstName: String
    lastName: String
    alias: String
  }

  input LocationInput {
    coordinates: [Float!]!
    address: AddressInput
  }

  input MediaInput {
    type: String!
    caption: String
    file: Upload!
  }

  input FactPeopleInput {
    id: String!
  }

  input FactInput {
    text: String!
    sources: [String]
    people: [FactPeopleInput]
    location: LocationInput
    media: [MediaInput]
  }

  input EventInput {
    name: String!
    date: Date!
  }

  input OrganizationInput {
    name: String!
    headQuarters: LocationInput!
  }

  input AddressInput {
    firstLine: String!
    secondLine: String
    city: String!
    country: String!
    postalCode: String!
  }

  type Person {
    id: String!
    firstName: String
    lastName: String
    alias: String
    createdAt: Date!
    updatedAt: Date!
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
    createdAt: Date!
    updatedAt: Date!
  }

  type Media {
    id: String!
    type: String!
    caption: String
    url: String!
    publicId: String!
    location: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Address {
    id: String!
    firstLine: String!
    secondLine: String
    city: String!
    country: String!
    postalCode: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Location {
    id: String!
    name: String!
    coordinates: [Float!]!
    address: Address
    createdAt: Date!
    updatedAt: Date!
  }

  type Fact {
    id: String!
    text: String!
    sources: [String]
    people: [Person]
    location: [Location]
    media: [Media]
    createdAt: Date!
    updatedAt: Date!
  }

  type Event {
    id: String!
    name: String!
    date: Date!
    createdAt: Date!
    updatedAt: Date!
  }

  type Organization {
    id: String!
    name: String!
    type: String!
    headQuarters: Location!
    website: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Contribution {
    id: String!
    type: String!
    approved: Boolean!
    user: User!
  }

  type Query {
    people: [Person!]!
    users: [User!]!
    facts: [Fact!]!
    events: [Event!]!
    organizations: [Organization!]!
    contributions: [Contribution!]!
    media: [Media!]!
  }

  type Mutation {
    createPerson(person: PersonInput): Person!
    createUser(user: UserInput): User!
    createFact(fact: FactInput): Fact!
    createEvent(event: EventInput): Event!
    createOrganization(organization: OrganizationInput): Organization!
    createMedia(media: MediaInput): Media!
  }
`;

const resolvers = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize(value) {
      return value.getTime(); // value sent to client
    },
    parseValue(value) {
      return new Date(value); // value from the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value); // ast value is always in string format
      }
      return null;
    },
  }),
  Upload: GraphQLUpload,
  Query,
  Mutation,
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ event, express: { req } }) => ({
    headers: event.headers,
    ...(await createContext({ req })),
  }),
});

export const handler = Sentry.AWSLambda.wrapHandler(
  server.createHandler({
    expressAppFromMiddleware(middleware) {
      const app = express();
      app.use(cookieParser());
      app.use(graphqlUploadExpress());
      app.use(middleware);
      return app;
    },
  }),
);
