import { createAsyncThunk, createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { handleAPIError } from 'common/apiErrorHandler';
import { ISyslog } from 'global/types';
import type { RootState, ThunkApiFields } from 'app/store';

type SyslogCreatePayload = {
  port: number;
  label: string;
  protocols: { protocol: string }[];
};

type SyslogUpdatePayload = {
  name: string;
  port: number;
  label: string;
  protocols: { protocol: string }[];
};

export const getSyslogs = createAsyncThunk<ISyslog[], undefined, ThunkApiFields>(
  'syslog/fetchAll',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const request = await api.get('event_syslog');
      return request.data as ISyslog[];
    } catch (err: any) {
      handleAPIError(err, 'Get Syslog Ports');
      return rejectWithValue(err.message);
    }
  }
);

export const createSyslog = createAsyncThunk<any, SyslogCreatePayload, ThunkApiFields>(
  'syslog/create',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const request = await api.post('event_syslog', payload);
      return request.data;
    } catch (err: any) {
      handleAPIError(err, 'Create Syslog Port');
      return rejectWithValue(err.message);
    }
  }
);

export const updateSyslog = createAsyncThunk<any, SyslogUpdatePayload, ThunkApiFields>(
  'syslog/update',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const request = await api.put('event_syslog', payload);
      return request.data;
    } catch (err: any) {
      handleAPIError(err, 'Update Syslog Port');
      return rejectWithValue(err.message);
    }
  }
);

export const deleteSyslog = createAsyncThunk<any, { name: string }, ThunkApiFields>(
  'syslog/delete',
  async ({ name }, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const request = await api.delete('event_syslog', { data: { name } });
      return request.data;
    } catch (err: any) {
      handleAPIError(err, 'Delete Syslog Port');
      return rejectWithValue(err.message);
    }
  }
);

interface ISyslogState {
  list: ISyslog[];
  loading: {
    get: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  errors: any;
}

const initialState: ISyslogState = {
  list: [],
  loading: {
    get: false,
    create: false,
    update: false,
    delete: false,
  },
  errors: null,
};

export const syslogSlice = createSlice({
  name: 'syslog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSyslogs.pending, (state) => { state.loading.get = true; })
      .addCase(getSyslogs.fulfilled, (state, { payload }) => {
        state.loading.get = false;
        state.list = payload || [];
      })
      .addCase(getSyslogs.rejected, (state) => { state.loading.get = false; })

      /* Unified Matchers for mutations */
      .addMatcher(
        (action): action is UnknownAction =>
          action.type.startsWith('syslog/') && action.type.endsWith('/pending') && !action.type.includes('fetchAll'),
        (state, action) => {
          if (action.type.includes('create')) state.loading.create = true;
          if (action.type.includes('update')) state.loading.update = true;
          if (action.type.includes('delete')) state.loading.delete = true;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<any> =>
          action.type.startsWith('syslog/') && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) && !action.type.includes('fetchAll'),
        (state) => {
          state.loading.create = false;
          state.loading.update = false;
          state.loading.delete = false;
        }
      );
  },
});

export default syslogSlice.reducer;
