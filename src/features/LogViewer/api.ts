import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'common/hooks';
import { fetchLogFiles } from './store/logViewerSlice';
import { RootState } from 'app/store';

export const useLogFiles = () => {
  const dispatch = useAppDispatch();
  const { files, loading, error } = useAppSelector((state: RootState) => state.logViewer);

  const getLogFiles = useCallback(() => {
    return dispatch(fetchLogFiles());
  }, [dispatch]);

  return { getLogFiles, data: files, loading, error };
};
