import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/app/ThemeContext';

export type TextVariant = 
  | 'header1'
  | 'header2'
  | 'header3'
  | 'body'
  | 'bodyBold'
  | 'caption'
  | 'button';

interface AccessibleTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  variant = 'body',
  style,
  color,
  ...rest
}) => {
  const { fontScale, theme } = useTheme();

  const styles = StyleSheet.create({
    header1: {
      fontSize: 24 * fontScale,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8 * fontScale,
    },
    header2: {
      fontSize: 20 * fontScale,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 6 * fontScale,
    },
    header3: {
      fontSize: 18 * fontScale,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4 * fontScale,
    },
    body: {
      fontSize: 16 * fontScale,
      color: theme.text,
    },
    bodyBold: {
      fontSize: 16 * fontScale,
      fontWeight: 'bold',
      color: theme.text,
    },
    caption: {
      fontSize: 14 * fontScale,
      color: theme.secondText,
    },
    button: {
      fontSize: 16 * fontScale,
      fontWeight: '600',
      color: theme.text,
    },
  });

  const combinedStyle = [
    styles[variant],
    color ? { color } : null,
    style,
  ];
  
  return (
    <Text style={combinedStyle} {...rest}>
      {children}
    </Text>
  );
};