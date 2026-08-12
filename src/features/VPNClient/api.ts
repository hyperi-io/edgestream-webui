import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/vpnSlice';
import { RootState } from 'app/store';

const selectState = (state: RootState) => state.vpn;

const run = async <T = any>(dispatchResult: any): Promise<T> => {
  const res = await dispatchResult;
  if (res?.error) throw res.payload || res.error;
  return res?.payload as T;
};

export const useVPNs = () => {
  const dispatch = useAppDispatch();
  const { items, statuses, loading } = useAppSelector(selectState);

  return {
    items,
    statuses,

    refreshList: (silent?: boolean) => dispatch(actions.listVPNs({ silent })),
    refreshStatuses: (silent?: boolean) => dispatch(actions.getVPNStatuses({ silent })),

    createVPN: (payload: Record<string, any>) => run(dispatch(actions.createVPN(payload))),
    updateVPN: (payload: Record<string, any>) => run(dispatch(actions.updateVPN(payload))),
    removeVPN: (payload: { id?: string; name?: string }) => run(dispatch(actions.deleteVPN(payload))),
    runAction: (name: string, action: 'start' | 'stop' | 'restart') => run(dispatch(actions.runVPN({ name, action }))),

    isFetching: !!loading['vpn/list/pending'] || !!loading['vpn/statuses/pending'],
    isSaving: !!loading['vpn/create/pending'] || !!loading['vpn/update/pending'],
    isDeleting: !!loading['vpn/delete/pending'],
    isOperating: !!loading['vpn/run/pending'],
  };
};
