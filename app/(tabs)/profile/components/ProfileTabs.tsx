import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'calendar', label: 'Kalendar' },
    { id: 'statistics', label: 'Štatistiky' },
    { id: 'info', label: 'Informácie' },
  ];

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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#F9F9F9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '40%',
    height: 3,
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});

export default ProfileTabs;