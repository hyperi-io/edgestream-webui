import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThunkApiFields } from 'app/store';
import type { IVPN, VPNStatusMap } from '../types';

export const listVPNs = createAsyncThunk<IVPN[], { silent?: boolean } | void, ThunkApiFields>(
  'vpn/list',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      return (await api.get('vpn_client')).data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? { detail: 'Failed to fetch VPN list.' });
    }
  }
);

export const getVPNStatuses = createAsyncThunk<VPNStatusMap, { silent?: boolean } | void, ThunkApiFields>(
  'vpn/statuses',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      return (await api.get('vpn_client/status')).data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? { detail: 'Failed to fetch VPN statuses.' });
    }
  }
);

export const createVPN = createAsyncThunk<any, Record<string, any>, ThunkApiFields>(
  'vpn/create',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      return (await api.post('vpn_client', payload)).data;
    } catch (err: any) {
      // Passes the entire response body (e.g., { detail: [...] } or { detail: "string" }) to res.payload
      return rejectWithValue(err.response?.data ?? { detail: 'Failed to create VPN profile.' });
    }
  }
);

export const updateVPN = createAsyncThunk<any, Record<string, any>, ThunkApiFields>(
  'vpn/update',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      return (await api.put('vpn_client', payload)).data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? { detail: 'Failed to update VPN profile.' });
    }
  }
);

export const deleteVPN = createAsyncThunk<any, { id?: string; name?: string }, ThunkApiFields>(
  'vpn/delete',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      return (await api.delete('vpn_client', { data: payload })).data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? { detail: 'Failed to delete VPN profile.' });
    }
  }
);

export const runVPN = createAsyncThunk<any, { name: string; action: 'start' | 'stop' | 'restart' }, ThunkApiFields>(
  'vpn/run',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      return (await api.post('vpn_client/run', payload)).data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? { detail: 'Failed to execute VPN command.' });
    }
  }
);

interface IVPNState {
  items: IVPN[];
  statuses: VPNStatusMap;
  loading: Record<string, boolean>;
}

const initialState: IVPNState = {
  items: [],
  statuses: {},
  loading: {},
};

export const vpnSlice = createSlice({
  name: 'vpn',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listVPNs.fulfilled, (state, { payload }) => {
        state.items = payload || [];
      })
      .addCase(getVPNStatuses.fulfilled, (state, { payload }) => {
        state.statuses = payload || {};
      })
      .addMatcher(
        (action): action is any => action.type.endsWith('/pending'),
        (state, action) => {
          const isSilent = action.meta?.arg?.silent === true;
          if (!isSilent) {
            state.loading[action.type] = true;
          }
        }
      )
      .addMatcher(
        (action): action is any => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state, action) => {
          const key = action.type.replace(/\/(fulfilled|rejected)$/, '/pending');
          state.loading[key] = false;
        }
      );
  },
});

export default vpnSlice.reducer;
