export type Gender = 'MALE' | 'FEMALE';
export type Theme = 'PINK' | 'GRAY';
export type ReactionType = 'LIKE' | 'FAVORITE' | 'DISLIKE';
export type LoginType = 'PHONE' | 'EMAIL';

export interface User {
  userId: string;
  avatar?: string;
  nickname: string;
  password: string;
  gender: Gender;
  phone?: string;
  email?: string;
}

export interface Category {
  categoryId: string;
  userId: string;
  name: string;
  isDefault: boolean;
}

export interface Item {
  itemId: string;
  categoryId: string;
  userId: string;
  imageUrl: string;
  name: string;
  createTime: string;
  price?: number;
}

export interface Outfit {
  outfitId: string;
  userId: string;
  items: string[];
  resultImageUrl?: string;
  createTime: string;
}

export interface Reaction {
  reactionId: string;
  userId: string;
  outfitId: string;
  type: ReactionType;
}

export interface AppState {
  users: User[];
  currentUserId: string | null;
  categories: Category[];
  items: Item[];
  outfits: Outfit[];
  reactions: Reaction[];
  theme: Theme;
}

export interface OutfitDraft {
  selections: Record<string, string>; // categoryId -> itemId
}
