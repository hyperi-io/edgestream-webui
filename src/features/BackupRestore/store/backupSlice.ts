import { createAsyncThunk, createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import fileDownload from 'js-file-download';
import { handleAPIError } from 'common/apiErrorHandler';
import type { RootState, ThunkApiFields } from 'app/store';

export const getBackupSettings = createAsyncThunk<any, undefined, ThunkApiFields>(
  'backup/getSettings',
  async (_, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const response = await api.get('/backup_restore');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveBackupSettings = createAsyncThunk<any, any, ThunkApiFields>(
  'backup/saveSettings',
  async (payload, { extra: { createAuthClient: api }, rejectWithValue }) => {
    try {
      const res = await api.post('backup_restore', payload);
      return res.data;
    } catch (err: any) {
      handleAPIError(err, 'Backup Settings');
      return rejectWithValue(err.message);
    }
  }
);

export const exportConfig = createAsyncThunk<void, undefined, ThunkApiFields>(
  'backup/export',
  async (_, { extra: { createAuthClientDownload: api } }) => {
    const response = await api.get('backup_restore/export');
    fileDownload(response.data, `config.yml`);
  }
);

export const restoreConfig = createAsyncThunk<any, FormData, ThunkApiFields>(
  'backup/restore',
  async (payload, { extra: { createAuthClientUpload: api }, rejectWithValue }) => {
    try {
      const res = await api.post('backup_restore/restore', payload);
      return res.data;
    } catch (err: any) {
      handleAPIError(err, 'Restore Config');
      return rejectWithValue(err.message);
    }
  }
);


interface IBackupState {
  data: any;
  loading: {
    get: boolean;
    save: boolean;
    restore: boolean;
  };
  errors: any;
}

const initialState: IBackupState = {
  data: null,
  loading: { get: false, save: false, restore: false },
  errors: null,
};

export const backupSlice = createSlice({
  name: 'backup',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBackupSettings.pending, (state) => { state.loading.get = true; })
      .addCase(getBackupSettings.fulfilled, (state, { payload }) => {
        state.loading.get = false;
        state.data = payload;
      })
      .addCase(getBackupSettings.rejected, (state) => { state.loading.get = false; })
      /* Matchers for Save/Restore */
      .addMatcher(
        (a): a is UnknownAction => a.type.startsWith('backup/') && a.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('save')) state.loading.save = true;
          if (action.type.includes('restore')) state.loading.restore = true;
        }
      )
      .addMatcher(
        (a): a is PayloadAction<any> => a.type.startsWith('backup/') && (a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected')),
        (state) => {
          state.loading.save = false;
          state.loading.restore = false;
        }
      );
  }
});

export default backupSlice.reducer;
