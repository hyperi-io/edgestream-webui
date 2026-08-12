import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleAPIError } from 'common/apiErrorHandler';
import { IDataTableFilter, IPaginatedResponse } from 'global/types';
import type { RootState, ThunkApiFields } from 'app/store';

export const getPaginatedData = createAsyncThunk<
  IPaginatedResponse<any>,
  { filter: IDataTableFilter; type: string },
  ThunkApiFields
>(
  'pagination/getData',
  async ({ type, filter }, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      // Map the internal type to the physical backend endpoint
      const endpointMap: Record<string, string> = {
        jobs: '/jobs',
        sources: '/sources',
        destinations: '/destinations',
        transforms: '/transforms',
        users: '/system/users'
      };

      const baseType = type.split('-')[0];
      const endpoint = endpointMap[baseType] || `/${baseType}`;

      const { search, page, limit, ...rest } = filter;

      const response = await api.get(endpoint, {
        params: {
          ...rest,
          search,
          page: page ?? 1,
          limit: limit ?? 30,
        },
      });

      return response.data.data || response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        handleAPIError(err, `Failed to load ${type} data`);
        return rejectWithValue(err.response?.data);
      }
      throw err;
    }
  },
);

export const paginationSlice = createSlice({
  name: 'pagination',
  initialState: {} as Record<string, any>,
  reducers: {
    setPagination: (state, action) => {
      const { type, pagination } = action.payload;
      if (!state[type]) state[type] = {
        pending: false,
        paginatedResponse: { data: [], total: 0, limit: 30 },
        sort: [],
        pagination
      };
      state[type].pagination = pagination;
    },
    setSort: (state, action) => {
      const { type, sort } = action.payload;
      if (state[type]) state[type].sort = sort;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaginatedData.pending, (state, action) => {
        const { type } = action.meta.arg;
        if (!state[type]) state[type] = {
          pending: true,
          paginatedResponse: { data: [], total: 0 },
          sort: [],
          pagination: { page: 1, limit: 30 }
        };
        state[type].pending = true;
      })
      .addCase(getPaginatedData.fulfilled, (state, action) => {
        const { type } = action.meta.arg;
        state[type].pending = false;
        state[type].paginatedResponse = action.payload;
      })
      .addCase(getPaginatedData.rejected, (state, action) => {
        const { type } = action.meta.arg;
        state[type].pending = false;
      });
  },
});

export const { setPagination, setSort } = paginationSlice.actions;
export const selectPagination = (state: RootState) => state.pagination;
export default paginationSlice.reducer;
