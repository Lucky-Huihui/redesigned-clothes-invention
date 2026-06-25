import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, Gender } from '@/types';
import { generateId } from '@/utils/id';

interface AuthState {
  users: User[];
  currentUserId: string | null;
}

const initialState: AuthState = {
  users: [],
  currentUserId: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register: (
      state,
      action: PayloadAction<{
        nickname: string;
        password: string;
        gender: Gender;
        phone?: string;
        email?: string;
      }>
    ) => {
      const user: User = {
        userId: generateId(),
        nickname: action.payload.nickname,
        password: action.payload.password,
        gender: action.payload.gender,
        phone: action.payload.phone,
        email: action.payload.email,
      };
      state.users.push(user);
      state.currentUserId = user.userId;
    },
    login: (state, action: PayloadAction<{ account: string; password: string }>) => {
      const { account, password } = action.payload;
      const user = state.users.find(
        (u) =>
          (u.phone === account || u.email === account || u.nickname === account) &&
          u.password === password
      );
      if (user) {
        state.currentUserId = user.userId;
      }
    },
    logout: (state) => {
      state.currentUserId = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User> & { userId: string }>) => {
      const user = state.users.find((u) => u.userId === action.payload.userId);
      if (user) {
        Object.assign(user, action.payload);
      }
    },
    deleteAccount: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.userId !== action.payload);
      if (state.currentUserId === action.payload) {
        state.currentUserId = null;
      }
    },
    setCurrentUser: (state, action: PayloadAction<string | null>) => {
      state.currentUserId = action.payload;
    },
  },
});

export const { register, login, logout, updateUser, deleteAccount, setCurrentUser } =
  authSlice.actions;
export default authSlice.reducer;
