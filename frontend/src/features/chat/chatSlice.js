// Redux slice for chat conversations + messages. Real-time updates from
// Socket.io are dispatched into this slice via the `messageReceived` reducer.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/chats');
    return data.chats;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load chats');
  }
});

export const openChatWith = createAsyncThunk(
  'chat/openWith',
  async (otherUserId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/chats/with/${otherUserId}`);
      return data.chat;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to open chat');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    activeChat: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    messageReceived(state, action) {
      const { chatId, message } = action.payload;
      if (state.activeChat && state.activeChat._id === chatId) {
        state.activeChat.messages.push(message);
      }
      const chat = state.chats.find((c) => c._id === chatId);
      if (chat) {
        chat.messages = chat.messages || [];
        chat.messages.push(message);
        chat.lastMessageAt = message.timestamp;
      }
    },
    setActiveChat(state, action) {
      state.activeChat = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(openChatWith.fulfilled, (state, action) => {
        state.activeChat = action.payload;
      });
  },
});

export const { messageReceived, setActiveChat } = chatSlice.actions;
export default chatSlice.reducer;
