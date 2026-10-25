/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    border: '#E2E8F0',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    primary: '#0284C7',
    primaryLight: '#E0F2FE',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    tabBarActive: '#0284C7',
    tabBarInactive: '#64748B',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    surface: '#1E293B',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    border: '#334155',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    card: '#1E293B',
    cardBorder: '#334155',
    primary: '#38BDF8',
    primaryLight: '#082F49',
    danger: '#F87171',
    dangerLight: '#450A0A',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    tabBarBackground: '#0F172A',
    tabBarBorder: '#1E293B',
    tabBarActive: '#38BDF8',
    tabBarInactive: '#94A3B8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
