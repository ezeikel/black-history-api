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
  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    profilePicture: String
    bio: String
    role: String
  }
  input PersonInput {
    firstName: String
    lastName: String
    alias: String
  }
  input LocationInput {
    name: String!
    coordinates: String!
    address: String!
  }
  input MediaInput {
    type: String!
    caption: String
    url: String!
    publicId: String!
  }
  input FactInput {
    text: String!
    sources: [String]
    people: [PersonInput]
    location: LocationInput
    media: [MediaInput]
  }
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
  type Media {
    id: String!
    type: String!
    caption: String
    url: String!
    publicId: String!
    location: String!
  }
  type Address {
    id: String!
    firstLine: String!
    secondLine: String
    city: String!
    country: String!
    postalCode: String!
  }
  type Location {
    id: String!
    name: String!
    # coordinates
    address: Address!
  }
  type Fact {
    id: String!
    text: String!
    sources: [String]
    people: [Person]
    location: [Location]
    media: [Media]
  }
  type Query {
    people: [Person!]!
    users: [User!]!
    facts: [Fact!]!
  }
  type Mutation {
    createPerson(person: PersonInput): Person!
    createUser(user: UserInput): User!
    createFact(fact: FactInput): Fact!
  }
`;

// TODO: look at old cuurly project and copy how inputTypes are defined and used

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
