import { createAsyncThunk, createSlice, UnknownAction } from '@reduxjs/toolkit';
import qs from 'qs';
import type { ThunkApiFields } from 'app/store';

interface ApiError {
  detail: string;
}

export const login = createAsyncThunk<any, any, ThunkApiFields & { rejectValue: ApiError }>(
  'auth/login',
  async (payload, { extra: { api }, rejectWithValue }) => {
    try {
      const body = qs.stringify({
        username: payload.username,
        password: payload.password,
        ...(payload.otp ? { otp: payload.otp } : {}),
      });

      const res = await api.post('auth/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('access_token', res.data.access_token);
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.detail) {
        return rejectWithValue({ detail: err.response.data.detail });
      }
      return rejectWithValue({ detail: 'An unexpected error occurred. Please try again.' });
    }
  }
);

export const fetchUser = createAsyncThunk<any, void, ThunkApiFields>(
  'auth/whoami',
  async (_, { extra: { createAuthClient: api } }) => {
    const res = await api.get('auth/whoami');
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  }
);

export const signup = createAsyncThunk<any, any, ThunkApiFields>(
  'auth/signup',
  async (payload, { extra: { api } }) => (await api.post('auth/signup', payload)).data
);

interface IAuthState {
  user: any | null;
  isAuthenticated: boolean;
  loading: Record<string, boolean>;
}

const initialState: IAuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: {},
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(login.fulfilled, (state) => {
        state.isAuthenticated = true;
      })
      .addMatcher((a): a is any => a.type.endsWith('/pending'), (state, action) => {
        state.loading[action.type] = true;
      })
      .addMatcher((a): a is any => a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected'), (state, action) => {
        const key = action.type.replace(/\/(fulfilled|rejected)$/, '/pending');
        state.loading[key] = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
