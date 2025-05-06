import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

interface TripSaveModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  isLoading: boolean;
  distance: number;
  duration: number;
}

const TripSaveModal: React.FC<TripSaveModalProps> = ({ 
  visible, 
  onClose, 
  onSave, 
  isLoading,
  distance,
  duration
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}min`;
  };

  const handleSave = () => {
    // Set default title if empty
    const finalTitle = title.trim() || `Trip ${new Date().toLocaleDateString('sk-SK')}`;
    onSave(finalTitle, description);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.text }]}>Save Your Trip</Text>
            
            <View style={[styles.statsContainer, { backgroundColor: theme.statBackground }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.text }]}>{distance.toFixed(2)} km</Text>
                <Text style={[styles.statLabel, { color: theme.thirdText }]}>Distance</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.text }]}>{formatDuration(duration)}</Text>
                <Text style={[styles.statLabel, { color: theme.thirdText }]}>Duration</Text>
              </View>
            </View>
            
            <Text style={[styles.inputLabel, { color: theme.text }]}>Trip Name</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: theme.border, 
                backgroundColor: theme.background,
                color: theme.text 
              }]}
              placeholder="Enter trip name"
              placeholderTextColor={theme.thirdText}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
            
            <Text style={[styles.inputLabel, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput, { 
                borderColor: theme.border, 
                backgroundColor: theme.background,
                color: theme.text 
              }]}
              placeholder="Enter trip description (optional)"
              placeholderTextColor={theme.thirdText}
              value={description}
              onChangeText={setDescription}
              multiline={true}
              maxLength={200}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { backgroundColor: theme.secondBackground }]} 
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, styles.cancelText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton, { backgroundColor: theme.primary }]} 
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={[styles.buttonText, styles.saveText]}>Save Trip</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
  },
  saveButton: {
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelText: {
  },
  saveText: {
    color: '#ffffff',
  },
});

export default TripSaveModal;