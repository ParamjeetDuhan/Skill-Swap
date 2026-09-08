// Redux slice for booking / managing skill-swap sessions.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchSessions = createAsyncThunk('sessions/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/sessions');
    return data.sessions;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load sessions');
  }
});

export const createSession = createAsyncThunk(
  'sessions/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/sessions', payload);
      return data.session;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create session');
    }
  }
);

export const updateSessionStatus = createAsyncThunk(
  'sessions/updateStatus',
  async ({ id, action }, { rejectWithValue }) => {
    // action = 'accept' | 'complete' | 'cancel'
    try {
      const { data } = await axiosClient.put(`/sessions/${id}/${action}`);
      return data.session;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update session');
    }
  }
);

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateSessionStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export default sessionsSlice.reducer;
