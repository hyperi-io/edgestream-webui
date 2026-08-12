import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/userSlice';
import { RootState } from 'app/store';
import { useCallback, useMemo } from 'react';

const selectUserState = (state: RootState) => state.user;

const run = async <T = any>(dispatchResult: any): Promise<T> => {
  const res = await dispatchResult;
  if (res?.error) throw res.error;
  return res?.payload as T;
};

export const useGetUsers = () => {
  const dispatch = useAppDispatch();
  const { items: data, loading, errors } = useAppSelector(selectUserState);

  const dataObject = useMemo(() => {
    return data.reduce((acc: Record<string, any>, item) => {
      acc[item.email] = item;
      return acc;
    }, {});
  }, [data]);

  const getUsers = useCallback(() => dispatch(actions.getUserItems()), [dispatch]);

  return {
    getUsers,
    data,
    dataObject,
    loading: loading.list,
    errors,
  };
};

export const useCreateUser = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectUserState);

  const createUser = useCallback(
    (payload: any) => run(dispatch(actions.createUser(payload))),
    [dispatch]
  );

  return { createUser, loading: loading.create };
};

export const useUpdateUser = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectUserState);

  const updateUser = useCallback(
    (payload: any) => run(dispatch(actions.updateUser(payload))),
    [dispatch]
  );

  return { updateUser, loading: loading.update };
};

export const useUpdateUserPassword = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectUserState);

  const updatePassword = useCallback(
    (payload: any) => run(dispatch(actions.updateUserPassword(payload))),
    [dispatch]
  );

  return { updatePassword, loading: loading.password };
};

export const useDeleteUser = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectUserState);

  const deleteUser = useCallback(
    (email: string) => run(dispatch(actions.deleteUser(email))),
    [dispatch]
  );

  return { deleteUser, loading: loading.delete };
};

export const useMfaActions = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectUserState);

  const generateOtp = useCallback(
    (payload: { email: string }) => run(dispatch(actions.otpGenerate(payload))),
    [dispatch]
  );

  const validateOtp = useCallback(
    (payload: any) => run(dispatch(actions.otpValidate(payload))),
    [dispatch]
  );

  return {
    generateOtp,
    validateOtp,
    loading: loading.otp,
  };
};
