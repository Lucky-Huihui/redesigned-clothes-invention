import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

import authReducer from './slices/authSlice';
import categoryReducer from './slices/categorySlice';
import itemReducer from './slices/itemSlice';
import outfitReducer from './slices/outfitSlice';
import reactionReducer from './slices/reactionSlice';
import themeReducer from './slices/themeSlice';
import outfitDraftReducer from './slices/outfitDraftSlice';

import { loadState, saveState } from '@/utils/storage';
import type { AppState } from '@/types';

export const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoryReducer,
  items: itemReducer,
  outfits: outfitReducer,
  reactions: reactionReducer,
  theme: themeReducer,
  outfitDraft: outfitDraftReducer,
});

const persisted = loadState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: persisted
    ? {
        auth: {
          users: persisted.users ?? [],
          currentUserId: persisted.currentUserId ?? null,
        },
        categories: { categories: persisted.categories ?? [] },
        items: { items: persisted.items ?? [] },
        outfits: { outfits: persisted.outfits ?? [] },
        reactions: { reactions: persisted.reactions ?? [] },
        theme: { theme: persisted.theme ?? 'PINK' },
        outfitDraft: { selections: {} },
      }
    : undefined,
});

store.subscribe(() => {
  const state = store.getState();
  const appState: AppState = {
    users: state.auth.users,
    currentUserId: state.auth.currentUserId,
    categories: state.categories.categories,
    items: state.items.items,
    outfits: state.outfits.outfits,
    reactions: state.reactions.reactions,
    theme: state.theme.theme,
  };
  saveState(appState);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
