import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'common/hooks';
import { fetchServicesStatus } from './servicesStatusSlice';
import { RootState } from 'app/store';

const POLLING_INTERVAL = 7000;

/**
 * useServicesStatus: Handles polling and state management for system service health.
 */
export const useServicesStatus = () => {
  const dispatch = useAppDispatch();

  const { data, loading, error, lastUpdated } = useAppSelector(
    (state: RootState) => state.servicesStatus
  );

  const refresh = useCallback(() => {
    return dispatch(fetchServicesStatus());
  }, [dispatch]);

  useEffect(() => {
    // Immediate fetch on mount
    refresh();

    // Set up standard polling
    const id = setInterval(refresh, POLLING_INTERVAL);

    return () => clearInterval(id);
  }, [refresh]);

  return {
    data,
    services: data?.services ?? [],
    overallStatus: data?.overall ?? 'down',
    loading: !!loading['servicesStatus/fetch/pending'],
    error,
    updatedAt: lastUpdated,
    refresh,
  };
};

export default useServicesStatus;
