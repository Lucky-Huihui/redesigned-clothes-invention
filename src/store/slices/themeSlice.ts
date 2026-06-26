import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: (localStorage.getItem('closetmate_theme') as Theme) || 'PINK',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem('closetmate_theme', action.payload);
    },
    toggleTheme(state) {
      state.theme = state.theme === 'PINK' ? 'GRAY' : 'PINK';
      localStorage.setItem('closetmate_theme', state.theme);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
