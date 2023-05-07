export * from './gql';
import { GraphQLClient } from 'graphql-request';

export const client = new GraphQLClient(
  'https://swapi-graphql.netlify.app/.netlify/functions/index',
);
