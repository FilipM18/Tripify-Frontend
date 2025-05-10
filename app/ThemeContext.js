import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAccessibleTheme } from './accessibilityThemes';

export const FONT_SIZES = {
  SMALL: 0.85,     // Malé
  NORMAL: 1,       // Normálne
  LARGE: 1.15,     // Veľké
  EXTRA_LARGE: 1.3, // Extra veľké
};

export const VISION_MODES = {
  NORMAL: 'normal',               // Normálny
  HIGH_CONTRAST: 'high-contrast', // Vysoký kontrast
  DEUTERANOPIA: 'deuteranopia',   // Zelená slepota (najčastejšia)
  PROTANOPIA: 'protanopia',       // Červená slepota
  TRITANOPIA: 'tritanopia',       // Modrá slepota (vzácna)
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState(FONT_SIZES.NORMAL);
  const [visionMode, setVisionMode] = useState(VISION_MODES.NORMAL);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        setIsDarkMode(deviceTheme === 'dark');
      }
      
      const savedFontScale = await AsyncStorage.getItem('fontScale');
      if (savedFontScale !== null) {
        setFontScale(parseFloat(savedFontScale));
      }
      
      const savedVisionMode = await AsyncStorage.getItem('visionMode');
      if (savedVisionMode !== null) {
        setVisionMode(savedVisionMode);
      }
    } catch (error) {
      console.log('Chyba pri načítavaní nastavení prístupnosti:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Chyba pri ukladaní preferencie témy:', error);
    }
  };

  const changeFontSize = async (newSize) => {
    try {
      setFontScale(newSize);
      await AsyncStorage.setItem('fontScale', newSize.toString());
    } catch (error) {
      console.log('Chyba pri ukladaní preferencie veľkosti písma:', error);
    }
  };

  const changeVisionMode = async (newMode) => {
    try {
      setVisionMode(newMode);
      await AsyncStorage.setItem('visionMode', newMode);
    } catch (error) {
      console.log('Chyba pri ukladaní preferencie režimu zobrazenia:', error);
    }
  };

  // Odvodenie skutočnej témy na základe nastavení prístupnosti
  const theme = createAccessibleTheme(isDarkMode, visionMode);
  
  // Hodnota, ktorá sa poskytne spotrebiteľom
  const contextValue = {
    isDarkMode,
    toggleTheme,
    fontScale,
    changeFontSize,
    visionMode,
    changeVisionMode,
    isLoading,
    theme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;