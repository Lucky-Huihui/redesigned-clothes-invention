import { getToken } from '@/api/client';
import type { Theme } from '@/types';

export function getThemeColors(theme: Theme) {
  const isBlue = theme === 'BLUE';
  return {
    primary: isBlue ? '#3B5998' : '#E8A0BF',
    primaryHover: isBlue ? '#2D4373' : '#D98AAE',
    primaryLight: isBlue ? '#C5D3E8' : '#F5D5E5',
    primaryBg: isBlue ? '#EFF3FA' : '#FDF2F8',
    primarySubtle: isBlue ? '#E8EDF5' : '#FCEEF5',
    accent: isBlue ? '#F59E0B' : '#B76E79',
    accentLight: isBlue ? '#FCD34D' : '#D4A0A7',
    bg: '#FFFFFF',
    bgSecondary: isBlue ? '#F8FAFC' : '#F9FAFB',
    bgTertiary: isBlue ? '#F1F5F9' : '#F3F4F6',
    border: isBlue ? '#E2E8F0' : '#E5E7EB',
    borderLight: isBlue ? '#F1F5F9' : '#F3F4F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    radiusMd: isBlue ? '6px' : '8px',
    radiusLg: isBlue ? '10px' : '12px',
    radiusXl: isBlue ? '14px' : '16px',
  };
}

export function themeDataAttr(theme: Theme): 'light' | 'male' {
  return theme === 'BLUE' ? 'male' : 'light';
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
