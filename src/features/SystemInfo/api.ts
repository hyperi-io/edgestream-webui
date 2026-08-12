import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/systemSlice';
import { RootState } from 'app/store';

const selectSystemState = (state: RootState) => state.system;

export const useSystem = () => {
  const dispatch = useAppDispatch();
  const { isManagedCollector } = useAppSelector(selectSystemState);

  const toggleIsManagedCollector = useCallback(() => {
    dispatch(actions.setIsManagedCollector(!isManagedCollector));
  }, [dispatch, isManagedCollector]);

  return { toggleIsManagedCollector, isManagedCollector };
};

export const useGetSystem = () => {
  const dispatch = useAppDispatch();
  const { info: data, loading } = useAppSelector(selectSystemState);

  const getSystem = useCallback((type?: string) => {
    return dispatch(actions.fetchSystem(type));
  }, [dispatch]);

  return {
    getSystem,
    data,
    loading: loading.info,
    hostname: data.hostname,
    interfaces: data.interfaces,
    activeUsers: data.users,
  };
};

export const useGetSystemVersion = () => {
  const dispatch = useAppDispatch();
  const { version: data } = useAppSelector(selectSystemState);

  const getSystemVersion = useCallback(() => {
    return dispatch(actions.fetchSystemVersion());
  }, [dispatch]);

  return { getSystemVersion, data };
};

export const useGetNetworkSummary = () => {
  const dispatch = useAppDispatch();
  const { network: data, loading, error } = useAppSelector(selectSystemState);

  const getNetworkSummary = useCallback(() => {
    return dispatch(actions.fetchNetworkSummary());
  }, [dispatch]);

  return { getNetworkSummary, data, loading: loading.network, error };
};

export const useGetComponents = () => {
  const dispatch = useAppDispatch();
  const { components: data, loading, error } = useAppSelector(selectSystemState);

  const getComponents = useCallback(() => {
    return dispatch(actions.fetchComponents());
  }, [dispatch]);

  return { getComponents, data, loading: loading.components, error };
};
