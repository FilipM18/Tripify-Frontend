import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const { isTablet } = useScreenDimensions();

  const tabs = [
    { id: 'calendar', label: 'Kalendár' },
    { id: 'statistics', label: 'Štatistiky' },
    { id: 'info', label: 'Informácie' },
  ];

  const styles = useScaledStyles((scale) => ({
    container: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.secondBackground,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      position: 'relative',
    },
    activeTab: {
      backgroundColor: theme.background,
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
  }));

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
          accessibilityLabel={tab.label}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab.label }}
        >
          <AccessibleText 
            variant="body"
            color={activeTab === tab.label ? theme.primary : theme.text}
            style={{ fontWeight: activeTab === tab.label ? 'bold' : 'normal' }}
          >
            {tab.label}
          </AccessibleText>
          {activeTab === tab.label && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ProfileTabs;