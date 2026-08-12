import { AxiosInstance } from 'axios';

import { configureStore } from '@reduxjs/toolkit';

import {
  createPublicClient,
  createAuthClient,
  createAuthClientUpload,
  createAuthClientDownload,
} from './client';
import rootReducer from './reducers';

export type ThunkExtra = {
  api: AxiosInstance;
  createAuthClient: ReturnType<typeof createAuthClient>;
  createAuthClientUpload: ReturnType<typeof createAuthClientUpload>;
  createAuthClientDownload: ReturnType<typeof createAuthClientDownload>;
};

const store = (baseURL: string) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            api: createPublicClient(baseURL),
            createAuthClient: createAuthClient(baseURL),
            createAuthClientUpload: createAuthClientUpload(baseURL),
            createAuthClientDownload: createAuthClientDownload(baseURL),
          } as ThunkExtra,
        },
      }),
      devTools: import.meta.env.DEV,
  });

const typeStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: {} as ThunkExtra },
    }),
});

export type RootState = ReturnType<typeof typeStore.getState>;
export type AppDispatch = typeof typeStore.dispatch;

export type ThunkApiFields = {
  dispatch: AppDispatch;
  state: RootState;
  rejectValue: string;
  rejectWithValue: (err: string) => void;
  extra: ThunkExtra;
};

export default store;
