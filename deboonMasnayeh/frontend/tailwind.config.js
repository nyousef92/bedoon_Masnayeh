/** @type {import('tailwindcss').Config} */
// Color palette: Gold (#C9A84C) + Jet Black (#111111) — jewelry theme
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          light:   'rgb(var(--color-primary-light) / <alpha-value>)',
          dark:    'rgb(var(--color-primary-dark) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          light:   'rgb(var(--color-secondary-light) / <alpha-value>)',
          dark:    'rgb(var(--color-secondary-dark) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          light:   'rgb(var(--color-accent-light) / <alpha-value>)',
          dark:    'rgb(var(--color-accent-dark) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          light:   'rgb(var(--color-success-light) / <alpha-value>)',
          dark:    'rgb(var(--color-success-dark) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          light:   'rgb(var(--color-warning-light) / <alpha-value>)',
          dark:    'rgb(var(--color-warning-dark) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          light:   'rgb(var(--color-danger-light) / <alpha-value>)',
          dark:    'rgb(var(--color-danger-dark) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--color-info) / <alpha-value>)',
          light:   'rgb(var(--color-info-light) / <alpha-value>)',
          dark:    'rgb(var(--color-info-dark) / <alpha-value>)',
        },
        surface:     'rgb(var(--color-surface) / <alpha-value>)',
        background:  'rgb(var(--color-background) / <alpha-value>)',
        text: {
          DEFAULT:   'rgb(var(--color-text) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted:     'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        border:      'rgb(var(--color-border) / <alpha-value>)',
        sidebar: {
          DEFAULT: 'rgb(var(--color-sidebar) / <alpha-value>)',
          hover:   'rgb(var(--color-sidebar-hover) / <alpha-value>)',
          active:  'rgb(var(--color-sidebar-active) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
