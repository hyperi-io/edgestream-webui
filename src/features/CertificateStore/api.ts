import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/certificateSlice';
import { RootState } from 'app/store';
import { useMemo, useCallback } from 'react';
import { useEffectOnce } from 'react-use';
import { IFile } from 'global/types';

const selectCertState = (state: RootState) => state.certs;

/**
 * Internal helper to handle thunk results in components.
 * This allows us to use async/await in the UI and catch errors
 * handled by the handleAPIError utility in the slice.
 */
const run = async <T = any>(dispatchResult: any): Promise<T> => {
  const res = await dispatchResult;
  if (res?.error) throw res.error;
  return res?.payload as T;
};

/**
 * Primary hook for managing the Certificate Store table.
 * Triggers an initial fetch automatically.
 */
export const useFileStore = () => {
  const dispatch = useAppDispatch();
  const { list: data, loading } = useAppSelector(selectCertState);

  const getFiles = useCallback(() => dispatch(actions.getFiles()), [dispatch]);

  // Eager load data when a component uses this hook
  useEffectOnce(() => {
    getFiles();
  });

  return { getFiles, data, loading: loading.get };
};

/** Alias for compatibility with existing components */
export const useGetFiles = useFileStore;

/**
 * Specialized hook for Source/Destination/VPN Drawers.
 * Automatically fetches and buckets files into categories for easy Select dropdown usage.
 */
export const useGetCertificates = () => {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector(selectCertState);

  // Organize the flat list into domain-specific buckets
  const buckets = useMemo(() => {
    return list.reduce(
      (acc, f) => {
        if (f.type === 'certificate') {
          acc.certificate.push(f);
        } else if (f.type === 'certificate_authority') {
          acc.certificateAuthority.push(f);
        } else if (f.type === 'private_key') {
          acc.privateKey.push(f);
        }
        return acc;
      },
      { certificate: [], certificateAuthority: [], privateKey: [] } as {
        certificate: IFile[];
        certificateAuthority: IFile[];
        privateKey: IFile[];
      }
    );
  }, [list]);

  const getCertificates = useCallback(() => dispatch(actions.getFiles()), [dispatch]);

  // Ensure dropdowns have data as soon as the drawer opens
  useEffectOnce(() => {
    getCertificates();
  });

  return {
    ...buckets,
    getCertificates,
    loading: loading.get,
  };
};

/**
 * Mutation hook for uploading new files
 */
export const useCreateFile = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectCertState);

  const createFile = useCallback(
    (payload: FormData) => run(dispatch(actions.createFile(payload))),
    [dispatch]
  );

  return { createFile, loading: loading.create };
};

/**
 * Mutation hook for updating file metadata (filename/type)
 */
export const useUpdateFile = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectCertState);

  const updateFile = useCallback(
    (payload: IFile) => run(dispatch(actions.updateFile(payload))),
    [dispatch]
  );

  return { updateFile, loading: loading.update };
};

/**
 * Mutation hook for deleting files
 */
export const useDeleteFile = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectCertState);

  const deleteFile = useCallback(
    (id: number) => run(dispatch(actions.deleteFile({ id }))),
    [dispatch]
  );

  return { deleteFile, loading: loading.delete };
};
