import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppUser } from '@/types';

interface AuthState {
  user: AppUser | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('closetmate_token'),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ user: AppUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    updateUser(state, action: PayloadAction<Partial<AppUser>>) {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('closetmate_token');
    },
  },
});

export const { setAuth, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
