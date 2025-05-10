import { StyleSheet } from 'react-native';
import { useTheme } from '@/app/ThemeContext';

export function useScaledStyles(createStyles: (fontScale: number) => any) {
  const { fontScale, theme } = useTheme();
  return StyleSheet.create(createStyles(fontScale));
}

export function scaleFontSize(fontSize: number, customScale?: number) {
  const { fontScale } = useTheme();
  return fontSize * (customScale || fontScale);
}

export function scaleSpacing(size: number, scale?: number) {
  const { fontScale } = useTheme();
  const spacingScale = Math.sqrt(scale || fontScale);
  return Math.round(size * spacingScale);
}