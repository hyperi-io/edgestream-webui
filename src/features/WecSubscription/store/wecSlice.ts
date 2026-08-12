import { createSlice, createAsyncThunk, UnknownAction } from '@reduxjs/toolkit';
import type { RootState, ThunkApiFields } from 'app/store';
import type { SubscriptionPayload, SubscriptionRow } from '../types';

export const fetchWec = createAsyncThunk<SubscriptionRow[], void, ThunkApiFields>(
  'wec/fetch',
  async (_, { extra: { createAuthClient: api } }) => (await api.get('wec/subscriptions/')).data
);

export const createWec = createAsyncThunk<SubscriptionRow, SubscriptionPayload, ThunkApiFields>(
  'wec/create',
  async (payload, { extra: { createAuthClient: api } }) => (await api.post('wec/subscriptions/', payload)).data
);

export const updateWec = createAsyncThunk<SubscriptionRow, { id: number; payload: SubscriptionPayload }, ThunkApiFields>(
  'wec/update',
  async ({ id, payload }, { extra: { createAuthClient: api } }) => (await api.put(`wec/subscriptions/${id}`, payload)).data
);

export const deleteWec = createAsyncThunk<number, number, ThunkApiFields>(
  'wec/delete',
  async (id, { extra: { createAuthClient: api } }) => {
    await api.delete(`wec/subscriptions/${id}`);
    return id;
  }
);

interface WecState {
  items: SubscriptionRow[];
  loading: Record<string, boolean>;
  error: any | null;
}

const initialState: WecState = {
  items: [],
  loading: {},
  error: null,
};

export const wecSlice = createSlice({
  name: 'wec',
  initialState,
  reducers: {
    clearWecError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWec.fulfilled, (state, { payload }) => {
        state.items = Array.isArray(payload) ? payload : [];
        state.error = null;
      })
      .addCase(createWec.fulfilled, (state, { payload }) => {
        state.items.push(payload);
        state.error = null;
      })
      .addCase(updateWec.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((r) => r.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
        state.error = null;
      })
      .addCase(deleteWec.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((r) => r.id !== payload);
        state.error = null;
      })
      // Global Matchers for Loading and Error states
      .addMatcher((a): a is UnknownAction => a.type.endsWith('/pending'), (state, action: any) => {
        state.loading[action.type] = true;
        state.error = null;
      })
      .addMatcher((a): a is UnknownAction => a.type.endsWith('/rejected'), (state, action: any) => {
        const key = action.type.replace('/rejected', '/pending');
        state.loading[key] = false;
        state.error = action.payload || action.error?.message || 'WEC Error';
      })
      .addMatcher((a): a is UnknownAction => a.type.endsWith('/fulfilled'), (state, action: any) => {
        const key = action.type.replace('/fulfilled', '/pending');
        state.loading[key] = false;
      });
  },
});

export const { clearWecError } = wecSlice.actions;
export default wecSlice.reducer;
