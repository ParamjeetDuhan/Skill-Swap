// Redux Toolkit store — combines all feature slices.

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import skillsReducer from '../features/skills/skillsSlice';
import matchesReducer from '../features/matches/matchesSlice';
import sessionsReducer from '../features/sessions/sessionsSlice';
import chatReducer from '../features/chat/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillsReducer,
    matches: matchesReducer,
    sessions: sessionsReducer,
    chat: chatReducer,
  },
});
