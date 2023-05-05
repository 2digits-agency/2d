import { graphql } from '../../../../packages/gql-codegen/src/swapi';

export const FilmFragment = graphql`
  fragment FilmItem on Film {
    id
    title
    releaseDate
    producers
  }
`;
console.log(/* GraphQL */ `
  fragment FilmItem on Film {
    id
    title
    releaseDate
    producers
  }
`);

export const allFilmsWithVariablesQueryDocument = graphql(/* GraphQL */ `
  query allFilmsWithVariablesQuery($first: Int!) {
    allFilms(first: $first) {
      edges {
        node {
          ...FilmItem
        }
      }
    }
  }
`);
