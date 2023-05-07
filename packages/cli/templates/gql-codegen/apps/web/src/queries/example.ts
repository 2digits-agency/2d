import { graphql, client } from '@mod/gql-codegen';

graphql(`
  fragment FilmItem on Film {
    id
    title
    producers
    releaseDate
  }
`);

const b = await client.request(
  graphql(`
    query allFilmsWithVariablesQuery($first: Int!) {
      allFilms(first: $first) {
        edges {
          node {
            ...FilmItem
          }
        }
      }
    }
  `),
  { first: 1 },
);

console.log(b.allFilms?.edges?.at(0)?.node?.__typename);
