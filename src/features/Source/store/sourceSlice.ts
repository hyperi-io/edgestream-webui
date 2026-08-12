import { createAsyncThunk, createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { handleAPIError } from 'common/apiErrorHandler';
import { IFormField } from 'global/types';
import type { RootState, ThunkApiFields } from 'app/store';

export const createSource = createAsyncThunk<any, any, ThunkApiFields>(
  'source/create',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.post(`/event_source/create`, payload);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to create source';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const deleteSource = createAsyncThunk<any, string | { name: string }, ThunkApiFields>(
  'source/delete',
  async (arg, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const name = typeof arg === 'string' ? arg : arg.name;
      const response = await api.delete('/event_source/delete', { data: { name } });
      return response?.data;
    } catch (err: any) {
      const name = typeof arg === 'string' ? arg : arg.name;
      const errorTitle = `Failed to delete source ${name}`;
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getSourceItems = createAsyncThunk<any[], undefined, ThunkApiFields>(
  'source/fetchAll',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`/event_source/fetch_all`);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get source items';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getSourceItem = createAsyncThunk<any, string, ThunkApiFields>(
  'source/fetchOne',
  async (name, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`/event_source/fetch/${name}`);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get source detail';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getSourceTemplate = createAsyncThunk<any, undefined, ThunkApiFields>(
  'source/template',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`/event_source/template`);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get source template';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getSourceTemplateItem = createAsyncThunk<IFormField, string, ThunkApiFields>(
  'source/templateItem',
  async (type, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.post('/event_source/template/by-type', { type });
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get source template item';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const updateSource = createAsyncThunk<any, any, ThunkApiFields>(
  'source/update',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.put(`/event_source/update`, payload);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to update source';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const updateSourceSettings = createAsyncThunk<any, any, ThunkApiFields>(
  'source/updateSettings',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.put(`/event_source/setting/modify/${payload.name}`, payload);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to update source settings';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

interface ISourceState {
  items: any[];
  activeItem: any;
  template: any;
  activeTemplate: IFormField | null;
  loading: {
    list: boolean;
    item: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    template: boolean;
  };
  errors: any;
}

const initialState: ISourceState = {
  items: [],
  activeItem: {},
  template: [],
  activeTemplate: null,
  loading: {
    list: false,
    item: false,
    create: false,
    update: false,
    delete: false,
    template: false,
  },
  errors: null,
};

export const sourceSlice = createSlice({
  name: 'source',
  initialState,
  reducers: {
    resetActiveSource: (state) => {
      state.activeItem = {};
      state.activeTemplate = null;
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* List */
      .addCase(getSourceItems.pending, (state) => { state.loading.list = true; })
      .addCase(getSourceItems.fulfilled, (state, { payload }) => {
        state.loading.list = false;
        state.items = payload;
      })
      .addCase(getSourceItems.rejected, (state, { payload }) => {
        state.loading.list = false;
        state.errors = payload;
      })
      /* Single Item */
      .addCase(getSourceItem.pending, (state) => { state.loading.item = true; })
      .addCase(getSourceItem.fulfilled, (state, { payload }) => {
        state.loading.item = false;
        state.activeItem = payload;
      })
      /* Templates */
      .addCase(getSourceTemplate.fulfilled, (state, { payload }) => {
        state.template = payload;
      })
      .addCase(getSourceTemplateItem.pending, (state) => { state.loading.template = true; })
      .addCase(getSourceTemplateItem.fulfilled, (state, { payload }) => {
        state.loading.template = false;
        state.activeTemplate = payload;
      })
      /* Mutations Logic */
      .addMatcher(
        (action): action is UnknownAction => action.type.startsWith('source/') && action.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('create')) state.loading.create = true;
          if (action.type.includes('update')) state.loading.update = true;
          if (action.type.includes('delete')) state.loading.delete = true;
          state.errors = null;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<any> =>
          action.type.startsWith('source/') && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')),
        (state, action) => {
          state.loading.create = false;
          state.loading.update = false;
          state.loading.delete = false;
          if (action.type.endsWith('/rejected')) state.errors = action.payload;
        }
      );
  },
});

export const { resetActiveSource } = sourceSlice.actions;
export default sourceSlice.reducer;
