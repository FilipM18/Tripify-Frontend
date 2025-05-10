import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useScaledStyles } from '@/utils/accessibilityUtils';

interface PhotoButtonProps {
  onPress: () => void;
  disabled: boolean;
}

export default function PhotoButton({ onPress, disabled }: PhotoButtonProps) {
  const { theme } = useTheme();
  
  const styles = useScaledStyles((scale) => ({
    button: {
      position: 'absolute',
      bottom: 100 * Math.sqrt(scale),  
      right: 20 * Math.sqrt(scale),
      backgroundColor: disabled ? theme.thirdText : theme.primary,
      width: 56 * Math.sqrt(scale),
      height: 56 * Math.sqrt(scale),
      borderRadius: 28 * Math.sqrt(scale),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 10,
    },
    iconSize: {
      fontSize: 24 * scale,
    }
  }));

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel="Odfotiť tento moment"
      accessibilityHint="Vytvorí fotku a pridá ju k vašej trase"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Ionicons 
        name="camera" 
        size={24} 
        color={theme.card}
        style={styles.iconSize}
      />
    </TouchableOpacity>
  );
}