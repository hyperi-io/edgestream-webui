import { createAsyncThunk, createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';

import { ISystem } from 'global/types';
import type { RootState, ThunkApiFields } from 'app/store';
import { handleAPIError } from 'common/apiErrorHandler';

export type NetworkSummaryResponse = {
  groups: Array<{
    title: string;
    items: Array<{
      iface: string;
      label: string;
      details: {
        ip?: string;
        netmask?: string;
        cidr?: string | null;
        gateway?: string | null;
        routes: Array<{ dst?: string; via?: string; proto?: string; metric?: number }>;
      };
    }>;
  }>;
};

export type ComponentsResponse = {
  sources_enabled: number;
  sinks_enabled: number;
};

export const fetchSystem = createAsyncThunk<ISystem, string | undefined, ThunkApiFields>(
  'system/fetchInfo',
  async (type, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const endpoint = type ? `system/${type}` : 'system/';
      const res = await api.get(endpoint);
      return res.data;
    } catch (err: any) {
      handleAPIError(err, 'Get System');
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSystemVersion = createAsyncThunk<string, undefined, ThunkApiFields>(
  'system/fetchVersion',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const res = await api.get('system/version');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchNetworkSummary = createAsyncThunk<NetworkSummaryResponse, undefined, ThunkApiFields>(
  'system/fetchNetwork',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const res = await api.get('system/network_summary');
      return res.data;
    } catch (err: any) {
      handleAPIError(err, 'Get Network Summary');
      return rejectWithValue(err.message);
    }
  }
);

export const fetchComponents = createAsyncThunk<ComponentsResponse, undefined, ThunkApiFields>(
  'system/fetchComponents',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const res = await api.get('system/components');
      return res.data;
    } catch (err: any) {
      handleAPIError(err, 'Get Components');
      return rejectWithValue(err.message);
    }
  }
);

interface ISystemState {
  info: ISystem;
  version: string;
  network: NetworkSummaryResponse | null;
  components: ComponentsResponse;
  isManagedCollector: boolean;
  loading: { info: boolean; network: boolean; components: boolean; };
  error: string | null;
}

const initialState: ISystemState = {
  info: { hostname: '', uptime: { secs: 0, human_readable: '' }, partitions: [], interfaces: [], users: [], ip_addresses: [] } as ISystem,
  version: '',
  network: null,
  components: { sources_enabled: 0, sinks_enabled: 0 },
  isManagedCollector: false,
  loading: { info: false, network: false, components: false },
  error: null,
};

export const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setIsManagedCollector: (state, action: PayloadAction<boolean>) => {
      state.isManagedCollector = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystem.pending, (state) => { state.loading.info = true; })
      .addCase(fetchSystem.fulfilled, (state, { payload }) => {
        state.loading.info = false;
        state.info = payload;
      })
      .addCase(fetchSystemVersion.fulfilled, (state, { payload }) => { state.version = payload; })
      .addCase(fetchNetworkSummary.pending, (state) => { state.loading.network = true; })
      .addCase(fetchNetworkSummary.fulfilled, (state, { payload }) => {
        state.loading.network = false;
        state.network = payload;
      })
      .addCase(fetchComponents.pending, (state) => { state.loading.components = true; })
      .addCase(fetchComponents.fulfilled, (state, { payload }) => {
        state.loading.components = false;
        state.components = payload;
      })
      .addMatcher(
        (a): a is UnknownAction => a.type.startsWith('system/') && a.type.endsWith('/rejected'),
        (state, action: any) => {
          state.loading.info = false;
          state.loading.network = false;
          state.loading.components = false;
          state.error = action.payload || 'System error';
        }
      );
  },
});

export const { setIsManagedCollector } = systemSlice.actions;
export default systemSlice.reducer;
