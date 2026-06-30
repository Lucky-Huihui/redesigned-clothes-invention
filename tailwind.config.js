/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-light': 'var(--color-primary-light)',
        'primary-bg': 'var(--color-primary-bg)',
        'primary-subtle': 'var(--color-primary-subtle)',
        accent: 'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        bg: 'var(--color-bg)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        divider: 'var(--color-divider)',
        ink: 'var(--color-text-primary)',
        'ink-2': 'var(--color-text-secondary)',
        'ink-3': 'var(--color-text-tertiary)',
        'ink-inverse': 'var(--color-text-inverse)',
        'brand-ink': 'var(--color-text-on-primary)',
        success: 'var(--state-success)',
        warning: 'var(--state-warning)',
        error: 'var(--state-error)',
        info: 'var(--state-info)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        card: 'var(--shadow-card)',
        fab: 'var(--shadow-fab)',
      },
      transitionTimingFunction: {
        'app-fast': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        'app-in': 'cubic-bezier(0.3, 0, 0, 1)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-down': 'slide-down 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
