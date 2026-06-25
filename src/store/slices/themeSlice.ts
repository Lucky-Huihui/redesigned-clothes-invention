import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Theme } from '@/types';

const initialState: { theme: Theme } = {
  theme: 'PINK',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'PINK' ? 'GRAY' : 'PINK';
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
