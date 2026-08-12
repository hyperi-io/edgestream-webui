import { createAsyncThunk, createSlice, UnknownAction } from '@reduxjs/toolkit';
import type { RootState, ThunkApiFields } from 'app/store';
import type { InfluxConfig } from '../types';

export const fetchConfig = createAsyncThunk<InfluxConfig, void, ThunkApiFields>(
  'config/fetch',
  async (_, { extra: { createAuthClient: api } }) => {
    const res = await api.get('influx_config/');
    return res.data as InfluxConfig;
  }
);

interface ConfigState {
  data: InfluxConfig | null;
  loading: Record<string, boolean>;
  error: any | null;
}

const initialState: ConfigState = {
  data: null,
  loading: {},
  error: null,
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.fulfilled, (state, { payload }) => {
        state.data = payload;
        state.error = null;
      })
      .addMatcher((a): a is UnknownAction => a.type.endsWith('/pending'), (state, action: any) => {
        state.loading[action.type] = true;
        state.error = null;
      })
      .addMatcher((a): a is UnknownAction => a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected'), (state, action: any) => {
        const key = action.type.replace(/\/(fulfilled|rejected)$/, '/pending');
        state.loading[key] = false;
        if (action.type.endsWith('/rejected')) {
          state.error = action.payload || action.error?.message || 'Failed to load config';
        }
      });
  },
});

export default configSlice.reducer;
