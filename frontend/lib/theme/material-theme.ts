import { createTheme } from '@mui/material/styles';

// Material Design 3 Color Tokens
export const m3Colors = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  tertiary: {
    main: '#6750a4',
    light: '#9a82db',
    dark: '#4f378b',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ba1a1a',
    light: '#ffdad6',
    dark: '#93000a',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ff9800',
    light: '#ffcc02',
    dark: '#e65100',
    contrastText: '#000000',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d3',
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  surface: {
    main: '#fef7ff',
    variant: '#f3edf7',
    container: '#f3edf7',
  },
  onSurface: {
    main: '#1d1b20',
    variant: '#49454f',
  },
  outline: {
    main: '#79747e',
    variant: '#c4c7c5',
  },
};

// Material Design 3 Typography Scale
export const m3Typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  displayLarge: {
    fontSize: '3.5rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
  },
  displayMedium: {
    fontSize: '2.8125rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
  },
  displaySmall: {
    fontSize: '2rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  headlineLarge: {
    fontSize: '2rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '0em',
  },
  headlineMedium: {
    fontSize: '1.75rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '0em',
  },
  headlineSmall: {
    fontSize: '1.5rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '0em',
  },
  titleLarge: {
    fontSize: '1.375rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '0em',
  },
  titleMedium: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0.015em',
  },
  titleSmall: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0.01em',
  },
  labelLarge: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0.01em',
  },
  labelMedium: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0.05em',
  },
  labelSmall: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0.05em',
  },
  bodyLarge: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.015em',
  },
  bodyMedium: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.025em',
  },
  bodySmall: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.04em',
  },
};

// Material Design 3 Theme Configuration
export const m3Theme = createTheme({
  palette: {
    mode: 'light',
    primary: m3Colors.primary,
    secondary: m3Colors.secondary,
    error: m3Colors.error,
    warning: m3Colors.warning,
    info: m3Colors.info,
    success: m3Colors.success,
    background: {
      default: m3Colors.surface.main,
      paper: m3Colors.surface.container,
    },
    text: {
      primary: m3Colors.onSurface.main,
      secondary: m3Colors.onSurface.variant,
    },
    divider: m3Colors.outline.variant,
  },
  typography: {
    fontFamily: m3Typography.fontFamily,
    // Map M3 variants to MUI typography
    displayLarge: m3Typography.displayLarge,
    displayMedium: m3Typography.displayMedium,
    displaySmall: m3Typography.displaySmall,
    headlineLarge: m3Typography.headlineLarge,
    headlineMedium: m3Typography.headlineMedium,
    headlineSmall: m3Typography.headlineSmall,
    titleLarge: m3Typography.titleLarge,
    titleMedium: m3Typography.titleMedium,
    titleSmall: m3Typography.titleSmall,
    labelLarge: m3Typography.labelLarge,
    labelMedium: m3Typography.labelMedium,
    labelSmall: m3Typography.labelSmall,
    bodyLarge: m3Typography.bodyLarge,
    bodyMedium: m3Typography.bodyMedium,
    bodySmall: m3Typography.bodySmall,
    // Standard MUI variants for compatibility
    h1: m3Typography.headlineLarge,
    h2: m3Typography.headlineMedium,
    h3: m3Typography.headlineSmall,
    h4: m3Typography.titleLarge,
    h5: m3Typography.titleMedium,
    h6: m3Typography.titleSmall,
    body1: m3Typography.bodyLarge,
    body2: m3Typography.bodyMedium,
    subtitle1: m3Typography.titleMedium,
    subtitle2: m3Typography.titleSmall,
    caption: m3Typography.bodySmall,
    overline: m3Typography.labelSmall,
  },
  shape: {
    borderRadius: 12, // M3 large border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // M3 prefers sentence case
          borderRadius: 12,
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: `1px solid ${m3Colors.outline.variant}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Dark Theme Variant
export const m3DarkTheme = createTheme({
  ...m3Theme,
  palette: {
    mode: 'dark',
    primary: m3Colors.primary,
    secondary: m3Colors.secondary,
    error: m3Colors.error,
    warning: m3Colors.warning,
    info: m3Colors.info,
    success: m3Colors.success,
    background: {
      default: '#0f0f0f',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    divider: '#333333',
  },
});