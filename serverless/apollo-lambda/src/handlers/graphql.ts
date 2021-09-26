import { ApolloServer, gql } from 'apollo-server-lambda';
import Query from '../resolvers/Query';
import Mutation from  '../resolvers/Mutation';
import { createContext } from '../context';

const typeDefs = gql`
  type Person {
    firstName: String!
    lastName: String!
  }
  type Query {
    people: [Person]
  }
  type Mutation {
    createPerson(firstName: String!, lastName: String!): Person!
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
  })
});

export const handler = server.createHandler();
