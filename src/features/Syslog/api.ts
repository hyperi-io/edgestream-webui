import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/syslogSlice';
import { RootState } from 'app/store';
import { useCallback } from 'react';

const selectSyslogState = (state: RootState) => state.syslog;

const run = async <T = any>(dispatchResult: any): Promise<T> => {
  const res = await dispatchResult;
  if (res?.error) throw res.error;
  return res?.payload as T;
};

export const useGetSyslogs = () => {
  const dispatch = useAppDispatch();
  const { list: data, loading } = useAppSelector(selectSyslogState);
  return {
    getSyslogs: useCallback(() => dispatch(actions.getSyslogs()), [dispatch]),
    data,
    loading: loading.get,
  };
};

export const useCreateSyslog = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectSyslogState);
  return {
    createSyslog: (payload: any) => run(dispatch(actions.createSyslog(payload))),
    loading: loading.create,
  };
};

export const useUpdateSyslog = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectSyslogState);
  return {
    updateSyslog: (payload: any) => run(dispatch(actions.updateSyslog(payload))),
    loading: loading.update,
  };
};

export const useDeleteSyslog = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectSyslogState);
  return {
    deleteSyslog: (payload: { name: string }) => run(dispatch(actions.deleteSyslog(payload))),
    loading: loading.delete,
  };
};
