import { createTheme } from '@mui/material/styles'

// Health Blue Color Palette
const colors = {
  primary: {
    main: '#0066CC',      // Deep health blue
    light: '#4A94E3',     // Lighter blue for hover states
    dark: '#004C99',      // Darker blue for emphasis
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#00A651',      // Health green
    light: '#4CCF8A',     // Lighter green
    dark: '#007840',      // Darker green
    contrastText: '#FFFFFF'
  },
  accent: {
    main: '#FF6B35',      // Alert/call to action orange
    light: '#FF9A6B',
    dark: '#CC5529'
  },
  neutral: {
    50: '#F0F8FF',        // Alice blue - very light background
    100: '#E3F2FD',       // Light blue tint
    200: '#BBDEFB',
    300: '#90CAF9',
    400: '#64B5F6',
    500: '#42A5F5',
    600: '#2196F3',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1'
  },
  background: {
    default: '#FAFBFC',
    paper: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #F0F8FF 0%, #E3F2FD 100%)'
  },
  text: {
    primary: '#1A202C',
    secondary: '#4A5568',
    disabled: '#A0AEC0',
    light: '#718096'
  }
}

// Dark-mode surface & text tokens (primary/secondary brand colors stay identical)
const darkColors = {
  background: {
    default: '#0A1929',
    paper: '#0F2740',
    gradient: 'linear-gradient(135deg, #0A1929 0%, #0F2740 100%)'
  },
  text: {
    primary: '#E7EBF0',
    secondary: '#AAB4BF',
    disabled: '#6F7E8C',
    light: '#8B98A5'
  }
}

// Typography configuration
const typography = {
  fontFamily: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif'
  ].join(','),
  h1: {
    fontSize: '2.75rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.7,
    fontWeight: 400
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    fontWeight: 400
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.01em'
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    fontWeight: 400
  }
}

// Shape configuration for rounded corners
const shape = {
  borderRadius: 12,
  borderRadiusSmall: 8,
  borderRadiusLarge: 16
}

// Shadow configuration - array format for MUI
const shadows = [
  'none',
  '0 1px 3px rgba(0, 85, 166, 0.08), 0 1px 2px rgba(0, 85, 166, 0.04)',
  '0 2px 6px rgba(0, 85, 166, 0.1), 0 2px 4px rgba(0, 85, 166, 0.06)',
  '0 4px 12px rgba(0, 85, 166, 0.12), 0 4px 8px rgba(0, 85, 166, 0.08)',
  '0 6px 16px rgba(0, 85, 166, 0.14), 0 6px 12px rgba(0, 85, 166, 0.1)',
  '0 8px 24px rgba(0, 85, 166, 0.16), 0 8px 16px rgba(0, 85, 166, 0.12)',
  '0 12px 32px rgba(0, 85, 166, 0.18), 0 12px 24px rgba(0, 85, 166, 0.14)',
  '0 16px 48px rgba(0, 85, 166, 0.2), 0 16px 32px rgba(0, 85, 166, 0.16)',
  '0 20px 56px rgba(0, 85, 166, 0.22), 0 20px 40px rgba(0, 85, 166, 0.18)',
  '0 24px 64px rgba(0, 85, 166, 0.24), 0 24px 48px rgba(0, 85, 166, 0.2)',
]
// MUI expects exactly 25 entries (elevation 0–24); pad the rest with the deepest shadow
while (shadows.length < 25) {
  shadows.push(shadows[shadows.length - 1])
}

// Custom shadow utilities
const customShadows = {
  card: '0 2px 8px rgba(0, 102, 204, 0.08), 0 1px 4px rgba(0, 102, 204, 0.04)',
  cardHover: '0 8px 24px rgba(0, 102, 204, 0.12), 0 4px 12px rgba(0, 102, 204, 0.08)',
  navigation: '0 2px 12px rgba(0, 85, 166, 0.08), 0 1px 4px rgba(0, 85, 166, 0.04)'
}

// Custom spacing utilities (not passed to MUI theme)
const customSpacing = {
  sectionXs: 3,
  sectionSm: 4,
  sectionMd: 6,
  sectionLg: 8,
  sectionXl: 10
}

// Breakpoints extension
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
    mobile: 0,
    tablet: 768,
    laptop: 1024,
    desktop: 1280
  }
}

// Animation configuration
const transitions = {
  easing: {
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  duration: {
    short: 200,
    standard: 300,
    complex: 400,
    slow: 600
  }
}

// Build the palette for a given color mode. Brand colors are shared; only
// surface, text, divider and action tokens differ between light and dark.
const buildPalette = (mode) => {
  const isDark = mode === 'dark'
  return {
    mode,
    primary: colors.primary,
    secondary: colors.secondary,
    error: { main: '#DC2626', light: '#EF4444', dark: '#B91C1C' },
    warning: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
    info: { main: colors.primary.main, light: colors.primary.light, dark: colors.primary.dark },
    success: { main: colors.secondary.main, light: colors.secondary.light, dark: colors.secondary.dark },
    background: isDark ? darkColors.background : colors.background,
    text: isDark ? darkColors.text : colors.text,
    divider: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 102, 204, 0.08)',
    action: isDark
      ? {
          hover: 'rgba(255, 255, 255, 0.06)',
          selected: 'rgba(255, 255, 255, 0.12)',
          disabled: 'rgba(255, 255, 255, 0.3)',
          disabledBackground: 'rgba(255, 255, 255, 0.12)'
        }
      : {
          hover: 'rgba(0, 102, 204, 0.04)',
          selected: 'rgba(0, 102, 204, 0.08)',
          disabled: 'rgba(0, 102, 204, 0.26)',
          disabledBackground: 'rgba(0, 102, 204, 0.12)'
        }
  }
}

// Create a theme for the requested color mode ('light' | 'dark')
export const createAppTheme = (mode = 'light') =>
  createTheme({
    palette: buildPalette(mode),
    typography,
    shape,
    shadows,
    breakpoints,
    transitions,
    mixins: {
      toolbar: {
        minHeight: 64
      },
      container: {
        maxWidth: 1280,
        padding: {
          xs: 2,
          sm: 3,
          md: 4
        }
      },
      section: {
        py: {
          xs: customSpacing.sectionXs,
          sm: customSpacing.sectionSm,
          md: customSpacing.sectionMd,
          lg: customSpacing.sectionLg
        }
      },
      card: {
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: shadows[4]
        }
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: shape.borderRadiusSmall,
            padding: '10px 24px',
            fontWeight: 600,
            letterSpacing: '0.01em',
            textTransform: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: shadows[2]
            }
          },
          contained: {
            boxShadow: shadows[1],
            '&:hover': {
              boxShadow: shadows[2]
            },
            '&:active': {
              transform: 'translateY(0)'
            }
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          },
          sizeLarge: {
            padding: '14px 32px',
            fontSize: '1rem'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: shape.borderRadius,
            boxShadow: shadows[1],
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            '&:hover': {
              boxShadow: shadows[4]
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: shape.borderRadius,
            backgroundImage: 'none'
          },
          elevation1: {
            boxShadow: shadows[1]
          },
          elevation2: {
            boxShadow: shadows[2]
          },
          elevation3: {
            boxShadow: shadows[3]
          },
          elevation4: {
            boxShadow: shadows[4]
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
            fontSize: '0.75rem'
          },
          filled: {
            '&.MuiChip-colorPrimary': {
              backgroundColor: colors.primary.main,
              color: colors.primary.contrastText
            },
            '&.MuiChip-colorSecondary': {
              backgroundColor: colors.secondary.main,
              color: colors.secondary.contrastText
            }
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: shadows[1]
          }
        }
      },
      MuiContainer: {
        styleOverrides: {
          maxWidthXl: {
            maxWidth: 1280
          }
        }
      }
    },
    custom: {
      colors,
      shadows,
      customShadows,
      spacing: customSpacing
    }
  })

// Default export: light theme (kept for any direct imports)
const theme = createAppTheme('light')

export default theme
