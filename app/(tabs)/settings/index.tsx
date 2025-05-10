import { router } from 'expo-router';
import React from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity,
  Switch,
  ScrollView, 
  Alert
} from 'react-native';
import { useTheme } from '../../ThemeContext'; 
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { getToken, removeToken } from '@/utils/auth';
import { apiRequest } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, fontScale } = useTheme();
  const { isTablet } = useScreenDimensions();
  const theme = useTheme().theme; 

  const handleLogout = async () => {
    try {
      const token = await getToken();
      if (token) {
        await apiRequest('/auth/logout', 'POST', undefined, token);
      }
      await removeToken();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Chyba pri odhlásení:', error);
      Alert.alert('Odhlásenie zlyhalo', error instanceof Error ? error.message : 'Neznáma chyba');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: isTablet ? 20: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: isTablet ? 24 * fontScale : 20 * fontScale,
      fontWeight: 'bold',
      color: theme.text,
    },
    scrollView: {
      flex: 1,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isTablet ? 20 : 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuText: {
      fontSize: isTablet ? 20 * fontScale : 16 * fontScale,
      marginLeft: isTablet ? 20 : 16,
      color: theme.text,
    },
    menuIcon: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    spacer: {
      flex: 1,
    },
    arrow: {
      fontSize: isTablet ? 20 * fontScale : 16 * fontScale,
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
          <View style={styles.menuIcon}>
            <Ionicons name="person-outline" size={24} color={theme.text} />
          </View>
          <Text style={styles.menuText}>Profil</Text>
          <View style={styles.spacer} />
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => {router.push(`/settings/password`)}}>
          <View style={styles.menuIcon}>
            <Ionicons name="key-outline" size={24} color={theme.text} />
          </View>
          <Text style={styles.menuText}>Heslo</Text>
          <View style={styles.spacer} />
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => {router.push(`/settings/notifications`)}}>
          <View style={styles.menuIcon}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
          </View>
          <Text style={styles.menuText}>Notifikácie</Text>
          <View style={styles.spacer} />
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => {router.push(`/settings/accessibility`)}}>
          <View style={styles.menuIcon}>
            <Ionicons name="accessibility-outline" size={24} color={theme.text} />
          </View>
          <Text style={styles.menuText}>Prístupnosť</Text>
          <View style={styles.spacer} />
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
          <View style={styles.menuIcon}>
            <Ionicons name={isDarkMode ? "moon-outline" : "sunny-outline"} size={24} color={theme.text} />
          </View>
          <Text style={styles.menuText}>Tmavý režim</Text>
          <View style={styles.spacer} />
          <Switch 
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.primary }}
            thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.menuIcon}>
            <Ionicons name="log-out-outline" size={24} color={theme.text} />
          </View>
          <Text style={styles.menuText}>Odhlásiť sa</Text>
          <View style={styles.spacer} />
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}