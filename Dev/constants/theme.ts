import { Platform } from 'react-native';

// Polymarket-inspired dark theme
export const Colors = {
  light: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textMuted: '#687076',
    background: '#0D1117',
    surface: '#161B22',
    surfaceHighlight: '#1C2128',
    border: '#30363D',
    tint: '#58A6FF',
    green: '#3FB950',
    red: '#F85149',
    orange: '#D29922',
    purple: '#BC8CFF',
    icon: '#9BA1A6',
    tabIconDefault: '#484F58',
    tabIconSelected: '#58A6FF',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textMuted: '#687076',
    background: '#0D1117',
    surface: '#161B22',
    surfaceHighlight: '#1C2128',
    border: '#30363D',
    tint: '#58A6FF',
    green: '#3FB950',
    red: '#F85149',
    orange: '#D29922',
    purple: '#BC8CFF',
    icon: '#9BA1A6',
    tabIconDefault: '#484F58',
    tabIconSelected: '#58A6FF',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Whale tier thresholds in USD
export const WHALE_TIERS = {
  SHRIMP: { min: 0, max: 1000, label: 'Shrimp', emoji: '' },
  DOLPHIN: { min: 1000, max: 10000, label: 'Dolphin', emoji: '' },
  WHALE: { min: 10000, max: 50000, label: 'Whale', emoji: '' },
  MEGA_WHALE: { min: 50000, max: Infinity, label: 'Mega Whale', emoji: '' },
} as const;
