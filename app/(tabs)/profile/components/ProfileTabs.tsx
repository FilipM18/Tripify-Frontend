import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();

  const tabs = [
    { id: 'calendar', label: 'Kalendár' },
    { id: 'statistics', label: 'Štatistiky' },
    { id: 'info', label: 'Informácie' },
  ];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.secondBackground,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: isTablet ? 16 : 12,
      position: 'relative',
    },
    activeTab: {
      backgroundColor: theme.background,
    },
    tabText: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: '500',
      color: theme.text,
    },
    activeTabText: {
      color: theme.primary,
      fontWeight: '600',
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      width: '40%',
      height: 3,
      backgroundColor: theme.primary,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },
  });

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.label && styles.activeTab
          ]}
          onPress={() => onTabChange(tab.label)}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab.label && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
          {activeTab === tab.label && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ProfileTabs;