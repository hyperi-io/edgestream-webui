import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { handleAPIError } from 'common/apiErrorHandler';
import type { ThunkApiFields } from 'app/store';

/**
 * Simple retry helper to avoid 502/503 errors during API restarts.
 */
const fetchWithRetry = async (apiCall: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  try {
    return await apiCall();
  } catch (err: any) {
    const status = err?.response?.status;
    // Retry on Gateway errors (502, 503, 504)
    if (retries > 0 && [502, 503, 504].includes(status)) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(apiCall, retries - 1, delay * 2); // Exponential backoff
    }
    throw err;
  }
};

export const fetchJobs = createAsyncThunk<any, string, ThunkApiFields>(
  'jobs/fetch',
  async (status, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const endpoint = (status && status !== 'all') ? `/task_status/${status}` : `/task_status`;
      const response = await api.get(endpoint);
      return response?.data;
    } catch (err: any) {
      handleAPIError(err, 'Get Jobs Status');
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRunningJobs = createAsyncThunk<any[], undefined, ThunkApiFields>(
  'jobs/fetchRunning',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await fetchWithRetry(() => api.get(`task_status`));
      return response?.data?.jobs || [];
    } catch (err: any) {
      handleAPIError(err, 'Get Running Jobs');
      return rejectWithValue(err.message);
    }
  }
);

interface IJobState {
  allJobs: any[];
  runningJobs: any[];
  loading: {
    all: boolean;
    running: boolean;
  };
  errors: any;
}

const initialState: IJobState = {
  allJobs: [],
  runningJobs: [],
  loading: {
    all: false,
    running: false,
  },
  errors: null,
};

export const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    resetJobState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading.all = true; })
      .addCase(fetchJobs.fulfilled, (state, { payload }) => {
        state.loading.all = false;
        state.allJobs = payload;
      })
      .addCase(fetchJobs.rejected, (state) => { state.loading.all = false; })

      .addCase(fetchRunningJobs.pending, (state) => { state.loading.running = true; })
      .addCase(fetchRunningJobs.fulfilled, (state, { payload }) => {
        state.loading.running = false;
        state.runningJobs = payload;
      })
      .addCase(fetchRunningJobs.rejected, (state) => { state.loading.running = false; });
  },
});

export const { resetJobState } = jobSlice.actions;
export default jobSlice.reducer;
