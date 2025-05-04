import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface EditPasswordFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EditPasswordForm: React.FC<EditPasswordFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = () => {
    if (!currentPassword || !newPassword) {
      alert('Please fill in all fields');
      return;
    }
    onSubmit(currentPassword, newPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
        secureTextEntry
      />
      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        secureTextEntry
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isSubmitting}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Change Password</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#666' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { backgroundColor: '#F0F0F0', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 },
  cancelText: { color: '#666', fontWeight: '500' },
  submitButton: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 },
  submitText: { color: '#fff', fontWeight: '600' },
});

export default EditPasswordForm;
