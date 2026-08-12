import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'app/store';

export interface EventMonitorMetrics {
  componentId: string;
  componentType: string;
  onType: string;
  receivedEventsTotal: string;
  sentEventsTotal: string;
  sentBytesTotal: string;
  errorsTotal: number;
  key: string;
}

interface IEventMonitorState {
  rows: EventMonitorMetrics[];
  loading: boolean;
  error: string | null;
}

const initialState: IEventMonitorState = {
  rows: [],
  loading: true,
  error: null,
};

export const eventMonitorSlice = createSlice({
  name: 'eventMonitor',
  initialState,
  reducers: {
    setInitialRows: (state, action: PayloadAction<EventMonitorMetrics[]>) => {
      state.rows = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateMetrics: (state, action: PayloadAction<{ componentId: string; value: string }>) => {
      const idx = state.rows.findIndex(r => r.componentId === action.payload.componentId);
      if (idx !== -1) {
        state.rows[idx].sentEventsTotal = action.payload.value;
      }
    },
    setStreamError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
});

export const { setInitialRows, updateMetrics, setStreamError, setLoading } = eventMonitorSlice.actions;
export const selectEventMonitor = (state: RootState) => state.eventMonitor;
export default eventMonitorSlice.reducer;
