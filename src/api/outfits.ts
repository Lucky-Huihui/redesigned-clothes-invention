import { api } from './client';

export interface Outfit {
  id: string;
  user_id: string;
  items: string[];
  result_image: string;
  feedback: 'LIKE' | 'FAVORITE' | 'DISLIKE' | null;
  created_at: string;
}

export interface ReactionWithOutfit {
  id: string;
  type: string;
  outfit: {
    id: string;
    items: string[];
    result_image: string;
    created_at: string;
  };
}

export async function getOutfits() {
  return api('/outfits') as Promise<Outfit[]>;
}

export async function createOutfit(items: string[], resultImage?: string) {
  return api('/outfits', {
    method: 'POST',
    body: { items, result_image: resultImage || '' },
  }) as Promise<Outfit>;
}

export async function setOutfitFeedback(id: string, feedback: string) {
  return api(`/outfits/${id}/feedback`, { method: 'PUT', body: { feedback } });
}

export async function getReactions(type: string) {
  return api(`/outfits/reactions/${type}`) as Promise<ReactionWithOutfit[]>;
}

export async function getReactionCounts() {
  return api('/outfits/reactions-count') as Promise<{ LIKE: number; FAVORITE: number; DISLIKE: number }>;
}

export async function deleteOutfit(id: string) {
  return api(`/outfits/${id}`, { method: 'DELETE' });
}
