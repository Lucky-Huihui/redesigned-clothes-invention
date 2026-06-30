export type Gender = 'MALE' | 'FEMALE';
export type Theme = 'PINK' | 'BLUE';
export type ReactionType = 'LIKE' | 'FAVORITE' | 'DISLIKE';

export interface AppUser {
  id: string;
  phone: string | null;
  email: string | null;
  nickname: string;
  avatar: string;
  gender: Gender;
  theme: Theme;
  created_at: string;
}

export interface AppCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  is_default: number;
  sort_order: number;
}

export interface AppItem {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  image: string;
  price: number | null;
  category_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AppOutfit {
  id: string;
  user_id: string;
  items: string[];
  result_image: string;
  feedback: ReactionType | null;
  created_at: string;
}

export interface OutfitDraftSelection {
  selections: Record<string, string>;
}
