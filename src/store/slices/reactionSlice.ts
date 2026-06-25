import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Reaction, ReactionType } from '@/types';
import { generateId } from '@/utils/id';

interface ReactionState {
  reactions: Reaction[];
}

const initialState: ReactionState = {
  reactions: [],
};

export const reactionSlice = createSlice({
  name: 'reactions',
  initialState,
  reducers: {
    setReaction: (
      state,
      action: PayloadAction<{
        userId: string;
        outfitId: string;
        type: ReactionType;
      }>
    ) => {
      const { userId, outfitId, type } = action.payload;
      const existingIndex = state.reactions.findIndex(
        (r) => r.userId === userId && r.outfitId === outfitId
      );
      if (existingIndex >= 0) {
        state.reactions[existingIndex].type = type;
      } else {
        state.reactions.push({
          reactionId: generateId(),
          userId,
          outfitId,
          type,
        });
      }
    },
    removeReaction: (
      state,
      action: PayloadAction<{ userId: string; outfitId: string }>
    ) => {
      state.reactions = state.reactions.filter(
        (r) =>
          !(r.userId === action.payload.userId && r.outfitId === action.payload.outfitId)
      );
    },
    clearUserReactions: (state, action: PayloadAction<string>) => {
      state.reactions = state.reactions.filter(
        (r) => r.userId !== action.payload
      );
    },
  },
});

export const { setReaction, removeReaction, clearUserReactions } =
  reactionSlice.actions;
export default reactionSlice.reducer;
