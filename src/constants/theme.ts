import { Platform, Dimensions } from 'react-native';

// ============================================================================
// PLATOON COLORS (Keep existing - these are working well)
// ============================================================================
export const PLATOON_COLORS = {
  light: {
    A: 'hsl(217, 19%, 27%)',
    B: 'hsl(193, 100%, 45%)',
    C: 'hsl(0, 75%, 55%)',
    D: 'hsl(115, 58%, 42%)',
  },
  dark: {
    A: 'hsl(220, 13%, 78%)',
    B: 'hsl(193, 95%, 65%)',
    C: 'hsl(0, 85%, 69%)',
    D: 'hsl(115, 47%, 69%)',
  },
} as const;

export type Platoon = keyof typeof PLATOON_COLORS.light;

// ============================================================================
// SYSTEMATIC COLOR PALETTE
// Based on hsl(220, 8%, X%) foundation with semantic naming
// ============================================================================

// Base color functions for generating consistent tones
// const zinc = (lightness: number) => `hsl(240, 5%, ${lightness}%)`; // Neutral zinc for dark mode
const gray = (lightness: number) => `hsl(225, 17%, ${lightness}%)`; // Neutral gray for dark mode
const warm = (lightness: number) => `hsl(25, 40%, ${lightness}%)`; // Earthy warm tone for light mode
// Semantic color system 
export const Colors = {
  light: {
    // Base surfaces (lightest to darkest) - all using warm earthy tone
    background: warm(98), // App background - slightly lighter than cards
    surface: warm(96), // Card/form backgrounds
    surfaceElevated: warm(95), // Input fields, elevated cards - more contrast
    surfaceHighlight: warm(100), // Active tab/toggle buttons - highest contrast

    // Text hierarchy - warmed up to match the background
    text: 'hsl(25, 15%, 20%)', // Primary text - warm dark brown
    textSecondary: 'hsl(25, 10%, 45%)', // Secondary text
    textMuted: 'hsl(25, 8%, 60%)', // Muted text, placeholders

    // Interactive elements
    primary: 'hsl(25, 15%, 20%)', // Primary buttons, links - matches text
    secondary: warm(85), // Secondary buttons - warm gray

    // Borders and dividers - warmed up
    border: warm(82), // Default borders - more visible
    borderLight: warm(88), // Lighter borders (calendar cells)
    borderStrong: warm(70), // Strong borders, focus states

    // Status colors
    success: 'hsl(115, 58%, 42%)', // Success states
    warning: 'hsl(45, 100%, 50%)', // Warning states
    error: 'hsl(0, 75%, 55%)', // Error states

    // Calendar highlights
    leaveHighlight: warm(93), // Annual leave day highlight - slightly darker for contrast

    // Component specific
    surfaceTrack: warm(92), // Segmented control/input track
    switchThumb: warm(80), // Switch thumb color

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal backdrop
  },
  dark: {
    // Base surfaces (darkest to lightest) - gray neutral
    background: gray(10), // App background
    surface: gray(12), // Card/form backgrounds
    surfaceElevated: gray(14), // Input fields, elevated cards
    surfaceHighlight: gray(20), // Active tab/toggle buttons

    // Text hierarchy - softer, less harsh
    text: gray(78), // Primary text - softer white
    textSecondary: gray(60), // Secondary text
    textMuted: gray(46), // Muted text, placeholders

    // Interactive elements
    primary: gray(78), // Primary buttons, links - matches text
    secondary: gray(25), // Secondary buttons

    // Borders and dividers
    border: gray(25), // Default borders
    borderLight: gray(18), // Lighter borders (calendar cells)
    borderStrong: gray(35), // Strong borders, focus states

    // Status colors
    success: 'hsl(115, 47%, 69%)', // Success states
    warning: 'hsl(45, 90%, 60%)', // Warning states
    error: 'hsl(0, 85%, 69%)', // Error states

    // Calendar highlights
    leaveHighlight: gray(20), // Annual leave day highlight

    // Component specific
    surfaceTrack: gray(8), // Segmented control/input track
    switchThumb: gray(50), // Switch thumb color

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.3)', // Modal backdrop (darker for dark mode)
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ============================================================================
// DESIGN TOKENS (Spacing, sizing, etc.)
// ============================================================================

// Moderate scaling for general UI (buttons, text, spacing) on tablets
const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;
const THEME_SCALE = IS_TABLET ? 1.2 : 1;

export const tokens = {
  // Spacing scale (4px base)
  space: {
    xs: 4 * THEME_SCALE,
    sm: 8 * THEME_SCALE,
    md: 12 * THEME_SCALE,
    lg: 16 * THEME_SCALE,
    xl: 20 * THEME_SCALE,
    xxl: 24 * THEME_SCALE,
    xxxl: 32 * THEME_SCALE,
  },

  // Border radius
  radius: {
    sm: 4 * THEME_SCALE,
    md: 6 * THEME_SCALE,
    lg: 8 * THEME_SCALE,
    xl: 12 * THEME_SCALE,
    xxl: 16 * THEME_SCALE,
  },

  // Typography scale
  fontSize: {
    xs: 10 * THEME_SCALE,
    sm: 12 * THEME_SCALE,
    md: 14 * THEME_SCALE,
    lg: 16 * THEME_SCALE,
    xl: 18 * THEME_SCALE,
    xxl: 20 * THEME_SCALE,
    xxxl: 24 * THEME_SCALE,
  },

  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Icon sizing
  icon: {
    sm: 16 * THEME_SCALE,
    md: 20 * THEME_SCALE,
    lg: 24 * THEME_SCALE,
    xl: 32 * THEME_SCALE,
  },
} as const;
