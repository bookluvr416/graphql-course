import { useQuery, useMutation } from "@apollo/client";
import { companyByIdQuery, jobByIdQuery, jobsQuery, createJobMutation } from "./queries";

export function useCompany(id) {
  const { data, loading, error } = useQuery(companyByIdQuery, {
    variables: { id },
  });
  return { company: data?.company, loading, error: Boolean(error) };
}

export function useJob(id) {
  const { data, loading, error } = useQuery(jobByIdQuery, {
    variables: { id },
  });
  return { job: data?.job, loading, error: Boolean(error) };
}

export function useJobs(limit, offset) {
  const { data, loading, error } = useQuery(jobsQuery, {
    fetchPolicy: 'network-only',
    variables: { limit, offset }
  });
  return { jobsData: data?.jobs, loading, error: Boolean(error) };
}

export function useCreateJob() {
  const [mutate, { loading, error }] = useMutation(createJobMutation);

  const createJob = async (title, description) => {
    const { data: { job } } = await mutate({
      variables: { input: { title, description } },
      update: (cache, { data }) => {
        cache.writeQuery({
          query: jobByIdQuery,
          variables: { id: data.job.id },
          data,
        });
      },
    });
    return job;
  };

  return { createJob, loading, error };
}
