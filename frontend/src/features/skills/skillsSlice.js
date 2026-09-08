// Redux slice for the logged-in user's "skills to teach" / "skills to learn".

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchMySkills = createAsyncThunk('skills/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/skills/mine');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load skills');
  }
});

export const addTeachSkill = createAsyncThunk(
  'skills/addTeach',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/skills/teach', payload);
      return data.skillsToTeach;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add skill');
    }
  }
);

export const addLearnSkill = createAsyncThunk(
  'skills/addLearn',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/skills/learn', payload);
      return data.skillsToLearn;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add skill');
    }
  }
);

export const removeTeachSkill = createAsyncThunk(
  'skills/removeTeach',
  async (skillId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(`/skills/teach/${skillId}`);
      return data.skillsToTeach;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove skill');
    }
  }
);

export const removeLearnSkill = createAsyncThunk(
  'skills/removeLearn',
  async (skillId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(`/skills/learn/${skillId}`);
      return data.skillsToLearn;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove skill');
    }
  }
);

const skillsSlice = createSlice({
  name: 'skills',
  initialState: {
    skillsToTeach: [],
    skillsToLearn: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySkills.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMySkills.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.skillsToTeach = action.payload.skillsToTeach;
        state.skillsToLearn = action.payload.skillsToLearn;
      })
      .addCase(fetchMySkills.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addTeachSkill.fulfilled, (state, action) => {
        state.skillsToTeach = action.payload;
      })
      .addCase(addLearnSkill.fulfilled, (state, action) => {
        state.skillsToLearn = action.payload;
      })
      .addCase(removeTeachSkill.fulfilled, (state, action) => {
        state.skillsToTeach = action.payload;
      })
      .addCase(removeLearnSkill.fulfilled, (state, action) => {
        state.skillsToLearn = action.payload;
      });
  },
});

export default skillsSlice.reducer;
