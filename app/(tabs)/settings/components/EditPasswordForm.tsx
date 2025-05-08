import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

interface EditPasswordFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EditPasswordForm: React.FC<EditPasswordFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();

  const handleSubmit = () => {
    if (!currentPassword || !newPassword) {
      alert('Prosím, vyplňte všetky polia!');
      return;
    }
    onSubmit(currentPassword, newPassword);
  };

  const styles = StyleSheet.create({
    container: { padding: isTablet ? 24 : 16, backgroundColor: theme.secondBackground},
    label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: theme.text },
    input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingHorizontal: isTablet ? 16 : 12, paddingVertical: isTablet ? 14 : 10, fontSize: isTablet ? 18 : 16, marginBottom: 16 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelButton: { backgroundColor: theme.secondBackground, borderRadius: 8, paddingVertical: isTablet ? 16 : 12, paddingHorizontal: 16 },
    cancelText: { color: theme.text, fontWeight: '500', fontSize: isTablet ? 16 : 12 },
    submitButton: { backgroundColor: theme.primary, borderRadius: 8, paddingVertical: isTablet ? 16 : 12, paddingHorizontal: 16, alignItems: 'center', marginLeft: 8 },
    submitText: { color: '#fff', fontWeight: '600', fontSize: isTablet ? 16 : 14 },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Heslo</Text>
      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Zadaj aktuálne heslo"
        placeholderTextColor={theme.secondText}
        secureTextEntry
      />
      <Text style={styles.label}>Nové heslo</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Zadaj nové heslo"
        placeholderTextColor={theme.secondText}
        secureTextEntry
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isSubmitting}>
          <Text style={styles.cancelText}>Zrušiť</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Zmeň heslo</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditPasswordForm;
