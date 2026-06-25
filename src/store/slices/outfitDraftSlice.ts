import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface OutfitDraftState {
  selections: Record<string, string>; // categoryId -> itemId
}

const initialState: OutfitDraftState = {
  selections: {},
};

export const outfitDraftSlice = createSlice({
  name: 'outfitDraft',
  initialState,
  reducers: {
    selectItem: (state, action: PayloadAction<{ categoryId: string; itemId: string }>) => {
      state.selections[action.payload.categoryId] = action.payload.itemId;
    },
    deselectItem: (state, action: PayloadAction<{ categoryId: string; itemId?: string }>) => {
      if (
        !action.payload.itemId ||
        state.selections[action.payload.categoryId] === action.payload.itemId
      ) {
        delete state.selections[action.payload.categoryId];
      }
    },
    clearDraft: (state) => {
      state.selections = {};
    },
  },
});

export const { selectItem, deselectItem, clearDraft } = outfitDraftSlice.actions;
export default outfitDraftSlice.reducer;
