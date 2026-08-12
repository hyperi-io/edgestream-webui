import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/backupSlice';
import { RootState } from 'app/store';
import { useCallback } from 'react';

const selectBackupState = (state: RootState) => state.backup;

const run = async <T = any>(dispatchResult: any): Promise<T> => {
  const res = await dispatchResult;
  if (res?.error) throw res.error;
  return res?.payload as T;
};

export const useBackupSettings = () => {
  const dispatch = useAppDispatch();
  const { data, loading, errors } = useAppSelector(selectBackupState);

  return {
    getBackupSettings: useCallback(() => dispatch(actions.getBackupSettings()), [dispatch]),
    saveBackupSettings: useCallback((payload: any) => run(dispatch(actions.saveBackupSettings(payload))), [dispatch]),
    data,
    loading: loading.get || loading.save,
    errors
  };
};

export const useConfigManagement = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectBackupState);

  return {
    exportConfig: useCallback(() => dispatch(actions.exportConfig()), [dispatch]),
    restoreConfig: useCallback((payload: FormData) => run(dispatch(actions.restoreConfig(payload))), [dispatch]),
    loading: loading.restore,
  };
};
