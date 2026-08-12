import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/jobsSlice';
import { RootState } from 'app/store';

const selectJobState = (state: RootState) => state.jobs;

export const useGetJobs = () => {
  const dispatch = useAppDispatch();
  const { allJobs: data, loading } = useAppSelector(selectJobState);

  const getJobs = useCallback((status?: string) => {
    return dispatch(actions.fetchJobs(<string>status));
  }, [dispatch]);

  return { getJobs, data, loading: loading.all };
};

export const useGetRunningJobs = () => {
  const dispatch = useAppDispatch();
  const { runningJobs: data, loading } = useAppSelector(selectJobState);

  const getRunningJobs = useCallback(() => {
    return dispatch(actions.fetchRunningJobs());
  }, [dispatch]);

  return { getRunningJobs, data, loading: loading.running };
};
