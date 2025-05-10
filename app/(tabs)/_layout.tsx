import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTheme } from '../ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { useScaledStyles } from '@/utils/accessibilityUtils';

export default function TabLayout() {
  const { theme, fontScale } = useTheme();
  const { isTablet } = useScreenDimensions();
  
  const getIconSize = () => {
    const baseSize = isTablet ? 28 : 24;
    return Math.round(baseSize * Math.sqrt(fontScale));
  };
  
  const getLabelFontSize = () => {
    const baseSize = isTablet ? 13 : 12;
    return Math.round(baseSize * fontScale);
  };

  const styles = useScaledStyles((scale) => ({
    tabBar: {
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      height: isTablet ? 75 * Math.sqrt(scale) : 65 * Math.sqrt(scale),
      paddingBottom: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      paddingTop: isTablet ? 8 * Math.sqrt(scale) : 5 * Math.sqrt(scale),
    },
    tabBarLabel: {
      fontSize: getLabelFontSize(),
      fontWeight: '500',
      marginTop: isTablet ? 4 * Math.sqrt(scale) : 2 * Math.sqrt(scale),
      marginBottom: isTablet ? 6 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
      lineHeight: getLabelFontSize() * 1.2,
    },
    tabBarItem: {
      paddingTop: isTablet ? 10 * Math.sqrt(scale) : 6 * Math.sqrt(scale),
      height: isTablet ? 60 * Math.sqrt(scale) : 50 * Math.sqrt(scale),
      paddingBottom: isTablet ? 8 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
    }
  }));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondText,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: true,
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={getIconSize()} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Domov",
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "recording" : "recording-outline"} 
              size={getIconSize()} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Nahrávanie",
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "map" : "map-outline"} 
              size={getIconSize()} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Spomienky",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={getIconSize()} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Profil",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "settings" : "settings-outline"} 
              size={getIconSize()} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Nastavenia",
        }}
      />
      
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}