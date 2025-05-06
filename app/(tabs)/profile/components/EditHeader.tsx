import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

interface EditHeaderProps {
  title: string;
  onBackPress: () => void;
}

const EditHeader: React.FC<EditHeaderProps> = ({ title, onBackPress }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 24 : 16,
      paddingVertical: isTablet ? 20 : 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: isTablet ? 22 : 18,
      fontWeight: 'bold',
      marginLeft: 16,
      color: theme.text,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={isTablet ? 24 : 20} color={theme.text} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default EditHeader;