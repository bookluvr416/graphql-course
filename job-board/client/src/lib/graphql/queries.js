import { ApolloClient, ApolloLink, concat, createHttpLink, gql, InMemoryCache } from '@apollo/client';
import { getAccessToken } from '../auth';

const httpLink = createHttpLink({ uri: 'http://localhost:9000/graphql' });

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    date
    description
    company {
      id
      name
    }
  }
`;

export const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id ) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export const companyByIdQuery = gql`
  query CompanyById($id: ID!) {
    company(id: $id ) {
      id
      name
      description
      jobs {
        id
        date
        title
      }
    }
  }  
`;

export const jobsQuery = gql`
  query Jobs($limit: Int, $offset: Int) {
    jobs(limit: $limit, offset: $offset) {
      items {
        id
        title
        date
        company {
          id
          name
        }
      }
      totalCount
    }
  }  
`;

export const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput!) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

// export async function createJob({ title, description }) {
//   const { data } = await apolloClient.mutate({
//     mutation: createJobMutation,
//     variables: {
//       input: { title, description },
//     },
//     update: (cache, { data }) => {
//       cache.writeQuery({
//         query: jobByIdQuery,
//         variables: { id: data.job.id },
//         data,
//       });
//     },
//   });
//   return data.job;
// };

// export async function getJobs() {
//   const { data } = await apolloClient.query({
//     query: jobsQuery,
//     fetchPolicy: 'network-only',
//   });
//   return data.jobs;
// };

// export async function getJob(id) {
//   const { data } = await apolloClient.query({ query: jobByIdQuery, variables: { id } });
//   return data.job;
// };
