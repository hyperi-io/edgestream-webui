import { createAsyncThunk, createSlice, UnknownAction } from '@reduxjs/toolkit';
import type { RootState, ThunkApiFields } from 'app/store';

interface ApiError {
  detail: string;
}

export const fetchPackages = createAsyncThunk<any, { refresh?: boolean } | undefined, ThunkApiFields & { rejectValue: ApiError }>(
  'updates/fetchPackages',
  async (params, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const endpoint = params?.refresh ? 'update/refresh' : 'update';
      const res = await api.get(endpoint);
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.detail) {
        return rejectWithValue({ detail: err.response.data.detail });
      }
      return rejectWithValue({ detail: err.message || 'An unexpected error occurred.' });
    }
  }
);

export const applyUpdates = createAsyncThunk<any, string[], ThunkApiFields & { rejectValue: ApiError }>(
  'updates/apply',
  async (packages, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const res = await api.put('update', packages);
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.detail) {
        return rejectWithValue({ detail: err.response.data.detail });
      }
      return rejectWithValue({ detail: err.message || 'An unexpected error occurred.' });
    }
  }
);

interface IUpdatesState {
  packages: any[];
  loading: Record<string, boolean>;
}

const initialState: IUpdatesState = {
  packages: [],
  loading: {},
};

export const updatesSlice = createSlice({
  name: 'updates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.fulfilled, (state, { payload }) => {
        const list = Array.isArray(payload)
          ? payload
          : payload?.packages ?? payload?.results ?? [];
        state.packages = Array.isArray(list) ? list : [];
      })
      .addMatcher(
        (a): a is UnknownAction => a.type.endsWith('/pending'),
        (state, action) => { state.loading[action.type] = true; }
      )
      .addMatcher(
        (a): a is UnknownAction => a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected'),
        (state, action) => {
          const key = action.type.replace(/\/(fulfilled|rejected)$/, '/pending');
          state.loading[key] = false;
        }
      );
  },
});

export default updatesSlice.reducer;
