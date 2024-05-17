import { GraphQLError } from 'graphql';
import { getJobs, getJob, getJobsByCompany, createJob, deleteJob, updateJob, getJobsCount } from './db/jobs.js';
import { getCompany } from './db/companies.js'

export const resolvers = {
  Query: {
    jobs: async (_root, { limit, offset }) => {
      const jobs = getJobs(limit, offset);
      const count = getJobsCount();
      return { items: jobs, totalCount: count };
    },
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) { 
        throw notFoundError('No job found with id ' + id);
      }
      return job;
    },
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError('No company found with id ' + id);
      }
      return company;
    },
  },

  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authorization.');
      }
      const companyId = user.companyId;
      return createJob({ companyId, title, description });
    },
    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authorization.');
      }
      const job = await deleteJob(id, user.companyId);

      if (!job) {
        throw notFoundError('No job found with id ' + id);
      }

      return job;
    },
    updateJob: async (_root, { input: { id, title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authorization.');
      }
      const job = await updateJob({ id, title, description, companyId: user.companyId });

      if (!job) {
        throw notFoundError('No job found with id ' + id);
      }

      return job;
    }
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  },

  Job: {
    date: (job) => toIsoDate(job.createdAt),
    company: (job, _args, { companyLoader }) => companyLoader.load(job.companyId),
  }
};

function toIsoDate(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
}

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' },
  });
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' },
  });
}
