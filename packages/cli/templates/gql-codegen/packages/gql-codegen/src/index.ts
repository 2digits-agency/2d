import { GraphQLClient } from 'graphql-request';

export * from './gql';

export const client = new GraphQLClient(
  'https://swapi-graphql.netlify.app/.netlify/functions/index',
);
