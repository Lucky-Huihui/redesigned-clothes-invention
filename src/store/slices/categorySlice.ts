import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '@/types';
import { generateId } from '@/utils/id';

const DEFAULT_CATEGORY_NAMES = ['上装', '下装', '袜子', '鞋子', '发饰', '耳饰', '外套', '背包'];

interface CategoryState {
  categories: Category[];
}

const initialState: CategoryState = {
  categories: [],
};

export const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    initializeDefaultCategories: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const existing = state.categories.filter((c) => c.userId === userId);
      if (existing.length > 0) return;
      DEFAULT_CATEGORY_NAMES.forEach((name) => {
        state.categories.push({
          categoryId: generateId(),
          userId,
          name,
          isDefault: true,
        });
      });
    },
    addCategory: (state, action: PayloadAction<{ userId: string; name: string }>) => {
      const { userId, name } = action.payload;
      const trimmed = name.trim();
      if (!trimmed) return;
      const exists = state.categories.some(
        (c) => c.userId === userId && c.name === trimmed
      );
      if (exists) return;
      state.categories.push({
        categoryId: generateId(),
        userId,
        name: trimmed,
        isDefault: false,
      });
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (c) => c.categoryId !== action.payload
      );
    },
    renameCategory: (
      state,
      action: PayloadAction<{ categoryId: string; name: string }>
    ) => {
      const category = state.categories.find(
        (c) => c.categoryId === action.payload.categoryId
      );
      if (category) {
        category.name = action.payload.name.trim();
      }
    },
    clearUserCategories: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (c) => c.userId !== action.payload
      );
    },
  },
});

export const {
  initializeDefaultCategories,
  addCategory,
  removeCategory,
  renameCategory,
  clearUserCategories,
} = categorySlice.actions;
export default categorySlice.reducer;
