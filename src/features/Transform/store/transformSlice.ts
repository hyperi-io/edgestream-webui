import { createAsyncThunk, createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { handleAPIError } from 'common/apiErrorHandler';
import type { RootState, ThunkApiFields } from 'app/store';

type DeleteTransformInput = string | { name?: string; id?: string; force?: boolean; namespace?: string };

export const createTransform = createAsyncThunk<any, any, ThunkApiFields>(
  'transform/create',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.post(`/event_transform/create`, payload);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to create transform';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const deleteTransform = createAsyncThunk<undefined, DeleteTransformInput, ThunkApiFields>(
  'transform/delete',
  async (input, { extra: { createAuthClient: api }, rejectWithValue }) => {
    const payload = typeof input === 'string' ? { name: input } : input;
    const label = payload.name ?? payload.id ?? 'unknown';
    try {
      const response = await api.delete('/event_transform/delete', { data: payload });
      return response?.data;
    } catch (err: any) {
      const errorTitle = `Failed to delete transform ${label}`;
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getTransformItems = createAsyncThunk<any[], undefined, ThunkApiFields>(
  'transform/fetchAll',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`/event_transform/fetch_all`);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get transform items';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getTransformParents = createAsyncThunk<any[], undefined, ThunkApiFields>(
  'transform/fetchParents',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`/event_transform/parents`);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get transform parents';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const updateTransform = createAsyncThunk<any, any, ThunkApiFields>(
  'transform/update',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.put(`/event_transform/update`, payload);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to update transform';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

interface ITransformState {
  items: any[];
  parents: any[];
  loading: {
    list: boolean;
    parents: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  errors: any;
}

const initialState: ITransformState = {
  items: [],
  parents: [],
  loading: {
    list: false,
    parents: false,
    create: false,
    update: false,
    delete: false,
  },
  errors: null,
};

export const transformSlice = createSlice({
  name: 'transform',
  initialState,
  reducers: {
    resetTransformState: (state) => {
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransformItems.pending, (state) => { state.loading.list = true; })
      .addCase(getTransformItems.fulfilled, (state, { payload }) => {
        state.loading.list = false;
        state.items = payload;
      })
      .addCase(getTransformItems.rejected, (state, { payload }) => {
        state.loading.list = false;
        state.errors = payload;
      })
      .addCase(getTransformParents.pending, (state) => { state.loading.parents = true; })
      .addCase(getTransformParents.fulfilled, (state, { payload }) => {
        state.loading.parents = false;
        state.parents = payload;
      })
      .addMatcher(
        (action): action is UnknownAction => action.type.startsWith('transform/') && action.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('create')) state.loading.create = true;
          if (action.type.includes('update')) state.loading.update = true;
          if (action.type.includes('delete')) state.loading.delete = true;
          state.errors = null;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<any> =>
          action.type.startsWith('transform/') && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')),
        (state, action) => {
          state.loading.create = false;
          state.loading.update = false;
          state.loading.delete = false;
          if (action.type.endsWith('/rejected')) state.errors = action.payload;
        }
      );
  },
});

export const { resetTransformState } = transformSlice.actions;
export default transformSlice.reducer;
