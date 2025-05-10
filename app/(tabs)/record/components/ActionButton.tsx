import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AccessibleText } from '@/components/AccessibleText';
import { useTheme } from '@/app/ThemeContext';
import { useScaledStyles } from '@/utils/accessibilityUtils';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { darkTheme } from '@/app/theme';

interface ActionButtonsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function ActionButtons({ isRecording, onStart, onStop }: ActionButtonsProps) {
  const { theme, visionMode } = useTheme();
  const { isTablet } = useScreenDimensions();
  const isDarkMode = theme.background === darkTheme.background;

  const getButtonColors = () => {
    const defaultColors = {
      start: 'rgba(76, 175, 80, 0.9)',
      stop: 'rgba(244, 67, 54, 0.9)' 
    };
    
    const highContrastColors = {
      start: isDarkMode ? 'rgba(0, 255, 170, 0.9)' : 'rgba(0, 102, 0, 0.9)',
      stop: isDarkMode ? 'rgba(255, 255, 0, 0.9)' : 'rgba(153, 0, 0, 0.9)'
    };
    
    const deuteranopiaColors = {
      start: 'rgba(0, 102, 204, 0.9)', 
      stop: 'rgba(255, 102, 0, 0.9)' 
    };
    
    const protanopiaColors = {
      start: 'rgba(0, 153, 204, 0.9)',
      stop: 'rgba(255, 204, 0, 0.9)' 
    };
    
    const tritanopiaColors = {
      start: 'rgba(102, 153, 0, 0.9)', 
      stop: 'rgba(204, 102, 0, 0.9)'  
    };
    
    switch(visionMode) {
      case 'high-contrast':
        return highContrastColors;
      case 'deuteranopia':
        return deuteranopiaColors;
      case 'protanopia':
        return protanopiaColors;
      case 'tritanopia':
        return tritanopiaColors;
      default:
        return defaultColors;
    }
  };

  const buttonColors = getButtonColors();

  const styles = useScaledStyles((scale) => ({
    container: {
      position: 'absolute',
      bottom: isTablet ? 150 * Math.sqrt(scale) : 100 * Math.sqrt(scale),
      left: 0,
      right: 0,
      alignItems: 'center',
      backgroundColor: 'transparent',
      zIndex: 10,
    },
    actionButton: {
      paddingVertical: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      paddingHorizontal: isTablet ? 60 * Math.sqrt(scale) : 40 * Math.sqrt(scale),
      borderRadius: isTablet ? 30 * Math.sqrt(scale) : 25 * Math.sqrt(scale),
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    startButton: {
      backgroundColor: buttonColors.start,
    },
    stopButton: {
      backgroundColor: buttonColors.stop,
    },
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          isRecording ? styles.stopButton : styles.startButton
        ]}
        onPress={isRecording ? onStop : onStart}
        accessibilityLabel={isRecording ? "Ukončiť záznam" : "Začať záznam"}
        accessibilityRole="button"
      >
        <AccessibleText 
          variant={isTablet ? "header2" : "button"} 
          color="white"
        >
          {isRecording ? 'Ukončiť' : 'Začať'}
        </AccessibleText>
      </TouchableOpacity>
    </View>
  );
}