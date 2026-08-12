import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/authSlice';
import { RootState } from 'app/store';

const selectState = (state: RootState) => state.auth;

const run = async <T = any>(dispatchResult: any): Promise<T> => {
  const res = await dispatchResult;
  if (res?.error) throw res.payload || res.error;
  return res?.payload as T;
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector(selectState);

  return {
    user,
    isAuthenticated,

    // Actions
    login: (p: any) => run(dispatch(actions.login(p))),
    signup: (p: any) => run(dispatch(actions.signup(p))),
    fetchUser: () => dispatch(actions.fetchUser()),
    logout: () => dispatch(actions.logout()),

    // Loading States
    isLoggingIn: !!loading['auth/login/pending'],
    isSigningUp: !!loading['auth/signup/pending'],
    isFetchingUser: !!loading['auth/whoami/pending'],
  };
};
