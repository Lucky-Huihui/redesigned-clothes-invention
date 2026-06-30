import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Theme } from '@/types';

const STORAGE_KEY = 'closetmate_theme';

function normalizeTheme(value: string | null): Theme {
  if (value === 'BLUE' || value === 'GRAY') return 'BLUE';
  return 'PINK';
}

interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: normalizeTheme(localStorage.getItem(STORAGE_KEY)),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload);
    },
    toggleTheme(state) {
      state.theme = state.theme === 'PINK' ? 'BLUE' : 'PINK';
      localStorage.setItem(STORAGE_KEY, state.theme);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
