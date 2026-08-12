import { createAsyncThunk, createSlice, UnknownAction } from '@reduxjs/toolkit';
import { handleAPIError } from 'common/apiErrorHandler';
import type { RootState, ThunkApiFields } from 'app/store';

export type PortResult = { port: number; ok: boolean };

export type Service = {
  key: string;
  name: string;
  unit: string;
  enabled: string;
  active: string;
  substate: string;
  uptime_seconds?: number;
  pid?: number;
  cpu_pct?: number;
  mem_pct?: number;
  ports: PortResult[];
  ports_ok: boolean;
  health_url?: string;
  http_ok?: boolean | null;
  optional: boolean;
  status: 'healthy' | 'degraded' | 'down' | 'disabled';
};

export type ServicesStatusResponse = {
  overall: 'healthy' | 'degraded' | 'down';
  services: Service[];
};

export const fetchServicesStatus = createAsyncThunk<
  ServicesStatusResponse,
  void,
  ThunkApiFields
>(
  'servicesStatus/fetch',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const res = await api.get('/system_services/status');
      return res.data as ServicesStatusResponse;
    } catch (err: any) {
      const title = 'Failed to load services status';
      handleAPIError(err, title);
      return rejectWithValue(title);
    }
  }
);

interface IServicesStatusState {
  data: ServicesStatusResponse | null;
  loading: Record<string, boolean>;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: IServicesStatusState = {
  data: null,
  loading: {},
  error: null,
  lastUpdated: null,
};

export const servicesStatusSlice = createSlice({
  name: 'servicesStatus',
  initialState,
  reducers: {
    resetStatus: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicesStatus.fulfilled, (state, { payload }) => {
        state.data = payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addMatcher((a): a is UnknownAction => a.type.endsWith('/pending'), (state, action) => {
        state.loading[action.type] = true;
        state.error = null;
      })
      .addMatcher(
        (a): a is UnknownAction => a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected'),
        (state, action: any) => {
          const key = action.type.replace(/\/(fulfilled|rejected)$/, '/pending');
          state.loading[key] = false;
          if (action.type.endsWith('/rejected')) {
            state.error = action.payload ?? 'An error occurred';
          }
        }
      );
  },
});

export const { resetStatus } = servicesStatusSlice.actions;
export default servicesStatusSlice.reducer;
