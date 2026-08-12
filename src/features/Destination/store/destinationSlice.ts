import { createAsyncThunk, createSlice, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import { handleAPIError } from 'common/apiErrorHandler';
import { IFormField } from 'global/types';
import axios from 'axios';
import type { RootState, ThunkApiFields } from 'app/store';

export const createDestination = createAsyncThunk<any, any, ThunkApiFields>(
  'destination/create',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.post(`/event_destination/create`, payload);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to create destination';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const deleteDestination = createAsyncThunk<any, string | { name: string }, ThunkApiFields>(
  'destination/delete',
  async (arg, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const name = typeof arg === 'string' ? arg : arg.name;
      const response = await api.delete('/event_destination/delete', { data: { name } });
      return response?.data;
    } catch (err: any) {
      const name = typeof arg === 'string' ? arg : arg.name;
      const errorTitle = `Failed to delete destination ${name}`;
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getDestinationItems = createAsyncThunk<any[], undefined, ThunkApiFields>(
  'destination/fetchAll',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`/event_destination/fetch_all`);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get destination items';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getDestinationItem = createAsyncThunk<any, string, ThunkApiFields>(
  'destination/fetchOne',
  async (name, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.post('/event_destination/fetch', { name });
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get destination detail';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getDestinationTemplate = createAsyncThunk<any, undefined, ThunkApiFields>(
  'destination/template',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`/event_destination/template`);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get destination template';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getDestinationTemplateItem = createAsyncThunk<IFormField, string, ThunkApiFields>(
  'destination/templateItem',
  async (type, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.post('/event_destination/template/by-type', { type });
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to get destination template item';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const updateDestination = createAsyncThunk<any, any, ThunkApiFields>(
  'destination/update',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.put(`/event_destination/update`, payload);
      return response?.data;
    } catch (err: any) {
      const errorTitle = 'Failed to update destination';
      if (err?.response) handleAPIError(err, errorTitle);
      return rejectWithValue(errorTitle);
    }
  }
);

export const getEventsItems = createAsyncThunk<any[], undefined, ThunkApiFields>(
  'destination/fetchEvents',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`/event_routing`);
      return response?.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        handleAPIError(err, 'Failed to get events');
        return rejectWithValue(err.response.data);
      }
      throw err;
    }
  }
);

interface IDestinationState {
  items: any[];
  events: any[]; // Routing labels
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
    events: boolean;
  };
  errors: any;
}

const initialState: IDestinationState = {
  items: [],
  events: [],
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
    events: false,
  },
  errors: null,
};

export const destinationSlice = createSlice({
  name: 'destination',
  initialState,
  reducers: {
    resetActiveItem: (state) => {
      state.activeItem = {};
      state.activeTemplate = null;
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* List */
      .addCase(getDestinationItems.pending, (state) => { state.loading.list = true; })
      .addCase(getDestinationItems.fulfilled, (state, { payload }) => {
        state.loading.list = false;
        state.items = payload;
      })
      .addCase(getDestinationItems.rejected, (state, { payload }) => {
        state.loading.list = false;
        state.errors = payload;
      })
      /* Events / Routing Labels */
      .addCase(getEventsItems.pending, (state) => { state.loading.events = true; })
      .addCase(getEventsItems.fulfilled, (state, { payload }) => {
        state.loading.events = false;
        state.events = payload;
      })
      .addCase(getEventsItems.rejected, (state, { payload }) => {
        state.loading.events = false;
        state.errors = payload;
      })
      /* Single Item */
      .addCase(getDestinationItem.pending, (state) => { state.loading.item = true; })
      .addCase(getDestinationItem.fulfilled, (state, { payload }) => {
        state.loading.item = false;
        state.activeItem = payload;
      })
      /* Templates */
      .addCase(getDestinationTemplate.fulfilled, (state, { payload }) => {
        state.template = payload;
      })
      .addCase(getDestinationTemplateItem.pending, (state) => { state.loading.template = true; })
      .addCase(getDestinationTemplateItem.fulfilled, (state, { payload }) => {
        state.loading.template = false;
        state.activeTemplate = payload;
      })
      /* Mutations */
      .addMatcher(
        (action): action is AnyAction => action.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('create')) state.loading.create = true;
          if (action.type.includes('update')) state.loading.update = true;
          if (action.type.includes('delete')) state.loading.delete = true;
          state.errors = null;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<any> =>
          action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading.create = false;
          state.loading.update = false;
          state.loading.delete = false;
          if (action.type.endsWith('/rejected')) state.errors = action.payload;
        }
      );
  },
});

export const { resetActiveItem } = destinationSlice.actions;
export default destinationSlice.reducer;
