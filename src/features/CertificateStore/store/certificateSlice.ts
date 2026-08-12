import { createAsyncThunk, createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { handleAPIError } from 'common/apiErrorHandler';
import { IFile } from 'global/types';
import type { RootState, ThunkApiFields } from 'app/store';

const FRESH_MS = 30_000;

export const getFiles = createAsyncThunk<IFile[], undefined, ThunkApiFields>(
  'certs/fetchAll',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get('/certificate_store');
      const data = response?.data;
      return data?.results ?? data?.result ?? (Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        handleAPIError(err, 'Failed to get files');
        return rejectWithValue(err.response?.data);
      }
      throw err;
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      const { loading, lastFetched } = state.certs;
      if (loading.get) return false;
      if (lastFetched && Date.now() - lastFetched < FRESH_MS) return false;
      return true;
    },
  }
);

export const createFile = createAsyncThunk<any, FormData, ThunkApiFields>(
  'certs/create',
  async (payload, { extra: { createAuthClientUpload: api }, rejectWithValue }) => {
    try {
      const request = await api.post('certificate_store/upload', payload);
      return request.data;
    } catch (err: any) {
      handleAPIError(err, 'Upload Failed');
      return rejectWithValue(err.message);
    }
  }
);

export const updateFile = createAsyncThunk<any, IFile, ThunkApiFields>(
  'certs/update',
  async ({ id, filename, type }, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const request = await api.put(`/certificate_store/${id}`, { filename, type });
      return request.data;
    } catch (err: any) {
      handleAPIError(err, 'Update Failed');
      return rejectWithValue(err.message);
    }
  }
);

export const deleteFile = createAsyncThunk<any, { id: number }, ThunkApiFields>(
  'certs/delete',
  async ({ id }, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const request = await api.delete(`/certificate_store/${id}`);
      return request.data;
    } catch (err: any) {
      handleAPIError(err, 'Delete Failed');
      return rejectWithValue(err.message);
    }
  }
);

interface ICertState {
  list: IFile[];
  lastFetched: number | null;
  inFlightId: string | null;
  loading: {
    get: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  errors: any;
}

const initialState: ICertState = {
  list: [],
  lastFetched: null,
  inFlightId: null,
  loading: {
    get: false,
    create: false,
    update: false,
    delete: false,
  },
  errors: null,
};

export const certificateSlice = createSlice({
  name: 'certs',
  initialState,
  reducers: {
    invalidateCerts: (state) => {
      state.lastFetched = null;
    },
    clearCertErrors: (state) => {
      state.errors = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFiles.pending, (state, action) => {
        state.loading.get = true;
        state.inFlightId = action.meta.requestId;
        state.errors = null;
      })
      .addCase(getFiles.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.inFlightId) return;
        state.loading.get = false;
        state.list = action.payload || [];
        state.lastFetched = Date.now();
        state.inFlightId = null;
      })
      .addCase(getFiles.rejected, (state, action) => {
        if (action.meta.requestId !== state.inFlightId) return;
        state.loading.get = false;
        state.errors = action.payload;
        state.inFlightId = null;
      })
      .addMatcher(
        (action): action is UnknownAction =>
          action.type.startsWith('certs/') && action.type.endsWith('/pending') && !action.type.includes('fetchAll'),
        (state, action) => {
          if (action.type.includes('create')) state.loading.create = true;
          if (action.type.includes('update')) state.loading.update = true;
          if (action.type.includes('delete')) state.loading.delete = true;
          state.errors = null;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<any> =>
          action.type.startsWith('certs/') && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) && !action.type.includes('fetchAll'),
        (state, action) => {
          state.loading.create = false;
          state.loading.update = false;
          state.loading.delete = false;
          if (action.type.endsWith('/rejected')) {
            state.errors = action.payload;
          } else {
            // Invalidate cache on success
            state.lastFetched = null;
          }
        }
      );
  },
});

export const { invalidateCerts, clearCertErrors } = certificateSlice.actions;
export default certificateSlice.reducer;
