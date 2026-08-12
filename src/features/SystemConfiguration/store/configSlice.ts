import { createAsyncThunk, createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import type { RootState, ThunkApiFields } from 'app/store';

const createNetThunk = (type: string, endpoint: string) => ({
  fetch: createAsyncThunk<any, undefined, ThunkApiFields>(`${type}/fetch`, async (_, { extra: { createAuthClient: api } }) => (await api.get(endpoint)).data),
  create: createAsyncThunk<any, any, ThunkApiFields>(`${type}/create`, async (p, { extra: { createAuthClient: api } }) => (await api.post(endpoint, p)).data),
  update: createAsyncThunk<any, any, ThunkApiFields>(`${type}/update`, async (p, { extra: { createAuthClient: api } }) => (await api.put(endpoint, p)).data),
  remove: createAsyncThunk<any, any, ThunkApiFields>(`${type}/delete`, async (p, { extra: { createAuthClient: api } }) => (await api.delete(endpoint, { data: p })).data),
});

export const dnsActions = createNetThunk('dns', 'dns_client');
export const ntpActions = createNetThunk('ntp', 'ntp_client');
export const routeActions = createNetThunk('routes', 'static_route');
export const fwdActions = createNetThunk('forwarders', 'dns_forwarding');
export const hostActions = createNetThunk('hosts', 'static_host');

export const fetchSystemSettings = createAsyncThunk<any, undefined, ThunkApiFields>('config/fetchSystem', async (_, { extra: { createAuthClient: api } }) => (await api.get('system_settings')).data);
export const updateSystemSettings = createAsyncThunk<any, any, ThunkApiFields>('config/updateSystem', async (p, { extra: { createAuthClient: api } }) => (await api.put('system_settings', p)).data);
export const fetchIpMgmt = createAsyncThunk<any, undefined, ThunkApiFields>('config/fetchIpMgmt', async (_, { extra: { createAuthClient: api } }) => (await api.get('interface_management')).data);
export const updateIpMgmt = createAsyncThunk<any, any, ThunkApiFields>('config/updateIpMgmt', async (p, { extra: { createAuthClient: api } }) => (await api.put('interface_management', p)).data);
export const fetchAdvancedSettings = createAsyncThunk<any[], undefined, ThunkApiFields>('config/fetchAdvanced', async (_, { extra: { createAuthClient: api } }) => (await api.get('advanced_setting/')).data);
export const updateAdvancedSettings = createAsyncThunk<any, any[], ThunkApiFields>('config/updateAdvanced', async (p, { extra: { createAuthClient: api } }) => (await api.put('advanced_setting/', p)).data);
export const fetchInterfaces = createAsyncThunk<any[], undefined, ThunkApiFields>('config/fetchIfaces', async (_, { extra: { createAuthClient: api } }) => (await api.get('system/interfaces')).data);

export const fetchTimezones = createAsyncThunk<string[], undefined, ThunkApiFields>(
  'config/fetchTz',
  async (_, { extra: { createAuthClient: api } }) => {
    const res = await api.get('system/timezones');
    return Array.isArray(res.data) ? res.data : res.data?.timezones || [];
  }
);

interface IConfigState {
  system: any;
  advanced: any[];
  dns: any[];
  ntp: any[];
  routes: any[];
  forwarders: any[];
  hosts: any[];
  ipMgmt: { mgmt: any; event: any };
  timezones: string[];
  interfaces: any[];
  isManagedCollector: boolean;
  loading: Record<string, boolean>;
}

const initialState: IConfigState = {
  system: {}, advanced: [], dns: [], ntp: [], routes: [], forwarders: [], hosts: [],
  ipMgmt: { mgmt: null, event: null },
  timezones: [], interfaces: [],
  isManagedCollector: false,
  loading: {},
};

export const configSlice = createSlice({
  name: 'systemConfig',
  initialState,
  reducers: {
    setManagedCollector: (state, action: PayloadAction<boolean>) => { state.isManagedCollector = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.fulfilled, (state, { payload }) => { state.system = payload; })
      .addCase(fetchAdvancedSettings.fulfilled, (state, { payload }) => { state.advanced = payload; })
      .addCase(dnsActions.fetch.fulfilled, (state, { payload }) => { state.dns = payload; })
      .addCase(ntpActions.fetch.fulfilled, (state, { payload }) => { state.ntp = payload; })
      .addCase(routeActions.fetch.fulfilled, (state, { payload }) => { state.routes = payload; })
      .addCase(fwdActions.fetch.fulfilled, (state, { payload }) => { state.forwarders = payload; })
      .addCase(hostActions.fetch.fulfilled, (state, { payload }) => { state.hosts = payload; })
      .addCase(fetchIpMgmt.fulfilled, (state, { payload }) => { state.ipMgmt = payload; })
      .addCase(fetchTimezones.fulfilled, (state, { payload }) => { state.timezones = payload; })
      .addCase(fetchInterfaces.fulfilled, (state, { payload }) => { state.interfaces = payload; })
      .addMatcher((a): a is UnknownAction => a.type.endsWith('/pending'), (state, action) => { state.loading[action.type] = true; })
      .addMatcher((a): a is UnknownAction => a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected'), (state, action) => {
        const key = action.type.replace(/\/(fulfilled|rejected)$/, '/pending');
        state.loading[key] = false;
      });
  },
});

export const { setManagedCollector } = configSlice.actions;
export default configSlice.reducer;
