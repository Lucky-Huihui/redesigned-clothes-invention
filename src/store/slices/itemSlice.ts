import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Item } from '@/types';
import { generateId } from '@/utils/id';

interface ItemState {
  items: Item[];
}

const initialState: ItemState = {
  items: [],
};

export const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{
        userId: string;
        categoryId: string;
        name: string;
        imageUrl: string;
        price?: number;
      }>
    ) => {
      state.items.push({
        itemId: generateId(),
        userId: action.payload.userId,
        categoryId: action.payload.categoryId,
        name: action.payload.name.trim(),
        imageUrl: action.payload.imageUrl,
        createTime: new Date().toISOString(),
        price: action.payload.price,
      });
    },
    updateItem: (
      state,
      action: PayloadAction<Partial<Item> & { itemId: string }>
    ) => {
      const item = state.items.find((i) => i.itemId === action.payload.itemId);
      if (item) {
        Object.assign(item, action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.itemId !== action.payload);
    },
    clearUserItems: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.userId !== action.payload);
    },
  },
});

export const { addItem, updateItem, removeItem, clearUserItems } = itemSlice.actions;
export default itemSlice.reducer;
