import { router } from 'expo-router';
import React from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity,
  Switch,
  ScrollView 
} from 'react-native';
import { useTheme } from '../../ThemeContext'; // Adjust path as needed
import { lightTheme, darkTheme } from '../../theme'; // Adjust path as needed


export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    scrollView: {
      flex: 1,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuText: {
      fontSize: 16,
      marginLeft: 16,
      color: theme.text,
    },
    spacer: {
      flex: 1,
    },
    arrow: {
      fontSize: 16,
      color: theme.text,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nastavenia</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity style={styles.menuItem} onPress={() => {router.push(`/settings/profile`)}}>
          <Text style={styles.menuText}>Profil</Text>
          <View style={styles.spacer} />
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => {router.push(`/settings/password`)}}>
          <Text style={styles.menuText}>Heslo</Text>
          <View style={styles.spacer} />
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => {router.push(`/settings/notifications`)}}>
          <Text style={styles.menuText}>Notifikácie</Text>
          <View style={styles.spacer} />
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
          <Text style={styles.menuText}>Tmavý režim</Text>
          <View style={styles.spacer} />
          <Switch 
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Odhlásiť sa</Text>
          <View style={styles.spacer} />
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
