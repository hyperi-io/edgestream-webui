import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/wecSlice';
import { RootState } from 'app/store';
import { SubscriptionPayload } from './types';

const selectState = (state: RootState) => state.wec;

const run = async <T = any>(dispatchResult: any): Promise<T> => {
  const res = await dispatchResult;
  if (res?.error) throw res.error;
  return res?.payload as T;
};

export const useWecSubscriptions = () => {
  const dispatch = useAppDispatch();
  const { items: rows, loading, error } = useAppSelector(selectState);

  return {
    rows,
    error,
    reload: () => dispatch(actions.fetchWec()),
    create: (payload: SubscriptionPayload) => run(dispatch(actions.createWec(payload))),
    update: (id: number, payload: SubscriptionPayload) => run(dispatch(actions.updateWec({ id, payload }))),
    remove: (id: number) => run(dispatch(actions.deleteWec(id))),

    isFetching: !!loading['wec/fetch/pending'],
    isSaving: !!loading['wec/create/pending'] || !!loading['wec/update/pending'],
    isDeleting: !!loading['wec/delete/pending'],
    loading: !!loading['wec/fetch/pending'] // backward compatibility for index.tsx
  };
};
