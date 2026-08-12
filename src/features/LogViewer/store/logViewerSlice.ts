import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { handleAPIError } from 'common/apiErrorHandler';
import type { RootState, ThunkApiFields } from 'app/store';

export const fetchLogFiles = createAsyncThunk<string[], undefined, ThunkApiFields>(
  'logViewer/fetchFiles',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`/log_viewer`);
      return response?.data || [];
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        handleAPIError(err, 'Failed to get log files');
        return rejectWithValue(err.response?.data);
      }
      throw err;
    }
  }
);

interface ILogViewerState {
  files: string[];
  loading: boolean;
  error: any;
}

const initialState: ILogViewerState = {
  files: [],
  loading: false,
  error: null,
};

export const logViewerSlice = createSlice({
  name: 'logViewer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogFiles.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.files = payload;
      })
      .addCase(fetchLogFiles.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default logViewerSlice.reducer;
