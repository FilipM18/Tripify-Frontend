import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

interface PhotoButtonProps {
  onPress: () => void;
  disabled: boolean;
}

export default function PhotoButton({ onPress, disabled }: PhotoButtonProps) {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme; 

  const styles = StyleSheet.create({
    button: {
      position: 'absolute',
      bottom: 100,  
      right: 20,
      backgroundColor: '#aaa',

      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 10,
    },
  });

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name="camera" size={24} color="white" />
    </TouchableOpacity>
  );
}
