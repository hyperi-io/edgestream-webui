import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/configSlice';
import { RootState } from 'app/store';

const selectState = (state: RootState) => state.systemConfig;

const run = async <T = any>(dispatchResult: any): Promise<T> => {
  const res = await dispatchResult;
  if (res?.error) throw res.error;
  return res?.payload as T;
};

export const useAdvancedSettings = () => {
  const dispatch = useAppDispatch();
  const { advanced: data, loading } = useAppSelector(selectState);

  return {
    fetchAdvancedSettings: useCallback(() => dispatch(actions.fetchAdvancedSettings()), [dispatch]),
    updateAdvancedSettings: (p: any[]) => run(dispatch(actions.updateAdvancedSettings(p))),
    data,
    loading: !!loading['config/fetchAdvanced/pending'],
    isUpdating: !!loading['config/updateAdvanced/pending'],
  };
};

export const useSystemSettings = () => {
  const dispatch = useAppDispatch();
  const { system: data, timezones, loading } = useAppSelector(selectState);

  return {
    fetchSystemSettings: useCallback(() => dispatch(actions.fetchSystemSettings()), [dispatch]),
    updateSystemSettings: (p: any) => run(dispatch(actions.updateSystemSettings(p))),
    fetchTimezones: useCallback(() => dispatch(actions.fetchTimezones()), [dispatch]),
    data,
    timezones,
    loading: !!loading['config/fetchSystem/pending'] || !!loading['config/fetchTz/pending'],
  };
};

export const useNetworkConfig = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectState);

  return {
    ...state, // Provides ipMgmt, dns, ntp, routes, hosts, forwarders, interfaces

    // IP Management & Interfaces
    fetchIpMgmt: useCallback(() => dispatch(actions.fetchIpMgmt()), [dispatch]),
    updateIpMgmt: (p: any) => run(dispatch(actions.updateIpMgmt(p))),
    fetchInterfaces: useCallback(() => dispatch(actions.fetchInterfaces()), [dispatch]),

    // DNS
    fetchDns: useCallback(() => dispatch(actions.dnsActions.fetch()), [dispatch]),
    createDns: (p: any) => run(dispatch(actions.dnsActions.create(p))),
    updateDns: (p: any) => run(dispatch(actions.dnsActions.update(p))),
    deleteDns: (p: any) => run(dispatch(actions.dnsActions.remove(p))),

    // NTP
    fetchNtp: useCallback(() => dispatch(actions.ntpActions.fetch()), [dispatch]),
    createNtp: (p: any) => run(dispatch(actions.ntpActions.create(p))),
    updateNtp: (p: any) => run(dispatch(actions.ntpActions.update(p))),
    deleteNtp: (p: any) => run(dispatch(actions.ntpActions.remove(p))),

    // Static Routes
    fetchRoutes: useCallback(() => dispatch(actions.routeActions.fetch()), [dispatch]),
    createRoute: (p: any) => run(dispatch(actions.routeActions.create(p))),
    updateRoute: (p: any) => run(dispatch(actions.routeActions.update(p))),
    deleteRoute: (p: any) => run(dispatch(actions.routeActions.remove(p))),

    // Static Hosts
    fetchHosts: useCallback(() => dispatch(actions.hostActions.fetch()), [dispatch]),
    createHost: (p: any) => run(dispatch(actions.hostActions.create(p))),
    updateHost: (p: any) => run(dispatch(actions.hostActions.update(p))),
    deleteHost: (p: any) => run(dispatch(actions.hostActions.remove(p))),

    // Forwarders
    fetchForwarders: useCallback(() => dispatch(actions.fwdActions.fetch()), [dispatch]),
    createForwarder: (p: any) => run(dispatch(actions.fwdActions.create(p))),
    updateForwarder: (p: any) => run(dispatch(actions.fwdActions.update(p))),
    deleteForwarder: (p: any) => run(dispatch(actions.fwdActions.remove(p))),

    // Generic loading check helper
    isPending: state.loading,
  };
};

export const useManagedCollector = () => {
  const dispatch = useAppDispatch();
  const { isManagedCollector } = useAppSelector(selectState);
  const toggleManagedCollector = useCallback((val: boolean) => dispatch(actions.setManagedCollector(val)), [dispatch]);
  return { isManagedCollector, toggleManagedCollector };
};
