import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/updatesSlice';
import { RootState } from 'app/store';

const selectState = (state: RootState) => state.updates;

const run = async <T = any>(dispatchResult: any): Promise<T> => {
  const res = await dispatchResult;
  if (res?.error) {
    throw res.payload || res.error;
  }
  return res?.payload as T;
};

export const useUpdates = () => {
  const dispatch = useAppDispatch();
  const { packages: data, loading } = useAppSelector(selectState);

  return {
    fetchPackages: (params?: { refresh?: boolean }) => run(dispatch(actions.fetchPackages(params))),
    applyUpdates: (packages: string[]) => run(dispatch(actions.applyUpdates(packages))),
    data,
    isFetching: !!loading['updates/fetchPackages/pending'],
    isUpdating: !!loading['updates/apply/pending'],
  };
};
