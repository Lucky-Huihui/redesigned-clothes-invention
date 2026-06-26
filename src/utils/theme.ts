import { getToken } from '@/api/client';
import type { Theme } from '@/types';

export function getThemeColors(theme: Theme) {
  const isMale = theme === 'GRAY';
  return {
    primary: isMale ? '#3B5998' : '#E8A0BF',
    primaryHover: isMale ? '#2D4373' : '#D98AAE',
    primaryLight: isMale ? '#C5D3E8' : '#F5D5E5',
    primaryBg: isMale ? '#EFF3FA' : '#FDF2F8',
    primarySubtle: isMale ? '#E8EDF5' : '#FCEEF5',
    accent: isMale ? '#F59E0B' : '#B76E79',
    accentLight: isMale ? '#FCD34D' : '#D4A0A7',
    bg: '#FFFFFF',
    bgSecondary: isMale ? '#F8FAFC' : '#F9FAFB',
    bgTertiary: isMale ? '#F1F5F9' : '#F3F4F6',
    border: isMale ? '#E2E8F0' : '#E5E7EB',
    borderLight: isMale ? '#F1F5F9' : '#F3F4F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    radiusMd: isMale ? '6px' : '8px',
    radiusLg: isMale ? '10px' : '12px',
    radiusXl: isMale ? '14px' : '16px',
  };
}

export function getTokenHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
