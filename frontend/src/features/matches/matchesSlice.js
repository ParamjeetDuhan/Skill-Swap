// Redux slice for the ranked list of matched peers.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchMatches = createAsyncThunk('matches/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/matches');
    return data.matches;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load matches');
  }
});

const matchesSlice = createSlice({
  name: 'matches',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default matchesSlice.reducer;
