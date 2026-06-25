import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Outfit } from '@/types';
import { generateId } from '@/utils/id';

interface OutfitState {
  outfits: Outfit[];
}

const initialState: OutfitState = {
  outfits: [],
};

export const outfitSlice = createSlice({
  name: 'outfits',
  initialState,
  reducers: {
    addOutfit: (
      state,
      action: PayloadAction<{ userId: string; items: string[]; resultImageUrl?: string }>
    ) => {
      state.outfits.push({
        outfitId: generateId(),
        userId: action.payload.userId,
        items: action.payload.items,
        resultImageUrl: action.payload.resultImageUrl,
        createTime: new Date().toISOString(),
      });
    },
    updateOutfitImage: (
      state,
      action: PayloadAction<{ outfitId: string; resultImageUrl: string }>
    ) => {
      const outfit = state.outfits.find(
        (o) => o.outfitId === action.payload.outfitId
      );
      if (outfit) {
        outfit.resultImageUrl = action.payload.resultImageUrl;
      }
    },
    removeOutfit: (state, action: PayloadAction<string>) => {
      state.outfits = state.outfits.filter((o) => o.outfitId !== action.payload);
    },
    clearUserOutfits: (state, action: PayloadAction<string>) => {
      state.outfits = state.outfits.filter((o) => o.userId !== action.payload);
    },
  },
});

export const { addOutfit, updateOutfitImage, removeOutfit, clearUserOutfits } =
  outfitSlice.actions;
export default outfitSlice.reducer;
