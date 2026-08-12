import { createAsyncThunk, createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { handleAPIError } from 'common/apiErrorHandler';
import { IUserItem } from 'global/types';
import type { ThunkApiFields } from 'app/store';

export const getUserItems = createAsyncThunk<IUserItem[], undefined, ThunkApiFields>(
  'user/fetchAll',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get(`user`);
      return response?.data.users;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        handleAPIError(err, 'Failed to get users');
        return rejectWithValue(err.response?.data);
      }
      throw err;
    }
  }
);

export const createUser = createAsyncThunk<any, any, ThunkApiFields>(
  'user/create',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const res = await api.post('user', payload);
      return res.data;
    } catch (err: any) {
      handleAPIError(err, 'Create User');
      return rejectWithValue(err.message);
    }
  }
);

export const updateUser = createAsyncThunk<any, any, ThunkApiFields>(
  'user/update',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.put(`user`, payload);
      return response?.data;
    } catch (err: any) {
      handleAPIError(err, 'Update User');
      return rejectWithValue('Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk<any, string, ThunkApiFields>(
  'user/delete',
  async (email, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.delete(`user`, { data: { email } });
      return response?.data;
    } catch (err: any) {
      handleAPIError(err, `Delete User ${email}`);
      return rejectWithValue(`Failed to delete user ${email}`);
    }
  }
);

export const updateUserPassword = createAsyncThunk<void, any, ThunkApiFields>(
  'user/updatePassword',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      await api.put('/user/password', payload);
    } catch (err: any) {
      handleAPIError(err, 'Update Password');
      return rejectWithValue('Failed to update password');
    }
  }
);

export const otpGenerate = createAsyncThunk<any, any, ThunkApiFields>(
  'user/otpGenerate',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.post(`/user/otp/generate`, payload);
      return response?.data;
    } catch (err: any) {
      handleAPIError(err, 'OTP Generate');
      return rejectWithValue('Failed to generate OTP');
    }
  }
);

export const otpValidate = createAsyncThunk<any, any, ThunkApiFields>(
  'user/otpValidate',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.post(`/user/otp/validate`, payload);
      return response?.data;
    } catch (err: any) {
      handleAPIError(err, 'OTP Validate');
      return rejectWithValue('Failed to validate OTP');
    }
  }
);

interface IUserState {
  items: IUserItem[];
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    password: boolean;
    otp: boolean;
  };
  errors: any;
}

const initialState: IUserState = {
  items: [],
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    password: false,
    otp: false,
  },
  errors: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUserStatus: (state) => {
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserItems.pending, (state) => { state.loading.list = true; })
      .addCase(getUserItems.fulfilled, (state, { payload }) => {
        state.loading.list = false;
        state.items = payload || [];
      })
      .addCase(getUserItems.rejected, (state) => { state.loading.list = false; })
      .addMatcher(
        (action): action is UnknownAction => action.type.startsWith('user/') && action.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('create')) state.loading.create = true;
          if (action.type.includes('updatePassword')) state.loading.password = true;
          if (action.type.includes('otp')) state.loading.otp = true;
          if (action.type.includes('update') && !action.type.includes('Password')) state.loading.update = true;
          if (action.type.includes('delete')) state.loading.delete = true;
          state.errors = null;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<any> =>
          action.type.startsWith('user/') && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')),
        (state) => {
          state.loading.create = false;
          state.loading.update = false;
          state.loading.delete = false;
          state.loading.password = false;
          state.loading.otp = false;
        }
      );
  },
});

export default userSlice.reducer;
