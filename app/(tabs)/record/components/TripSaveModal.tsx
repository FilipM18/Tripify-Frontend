import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

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
  const { theme, fontScale } = useTheme();

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}min`;
  };

  const handleSave = () => {
    const finalTitle = title.trim() || `Trip ${new Date().toLocaleDateString('sk-SK')}`;
    onSave(finalTitle, description);
  };

  const styles = useScaledStyles((scale) => ({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20 * Math.sqrt(scale),
    },
    modalContent: {
      borderRadius: 10,
      padding: 20 * Math.sqrt(scale),
      backgroundColor: theme.card,
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      maxHeight: '80%',
    },
    title: {
      fontSize: 20 * scale,
      fontWeight: 'bold',
      marginBottom: 15 * Math.sqrt(scale),
      textAlign: 'center',
      color: theme.text,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20 * Math.sqrt(scale),
      padding: 15 * Math.sqrt(scale),
      backgroundColor: theme.statBackground,
      borderRadius: 8,
    },
    statBox: {
      alignItems: 'center',
    },
    inputLabel: {
      fontSize: 16 * scale,
      fontWeight: '500',
      marginBottom: 5 * Math.sqrt(scale),
      color: theme.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 10 * Math.sqrt(scale),
      marginBottom: 15 * Math.sqrt(scale),
      fontSize: 16 * scale,
      color: theme.text,
      backgroundColor: theme.background,
    },
    descriptionInput: {
      height: 100 * Math.sqrt(scale),
      textAlignVertical: 'top',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10 * Math.sqrt(scale),
    },
    button: {
      flex: 1,
      padding: 15 * Math.sqrt(scale),
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5 * Math.sqrt(scale),
    },
    cancelButton: {
      backgroundColor: theme.secondBackground,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
  }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={styles.modalContent}>
            <AccessibleText style={styles.title}>Ulož svôj výlet</AccessibleText>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <AccessibleText variant="bodyBold">{distance.toFixed(2)} km</AccessibleText>
                <AccessibleText variant="caption">Vzdialenosť</AccessibleText>
              </View>
              <View style={styles.statBox}>
                <AccessibleText variant="bodyBold">{formatDuration(duration)}</AccessibleText>
                <AccessibleText variant="caption">Trvanie</AccessibleText>
              </View>
            </View>
            
            <AccessibleText variant="body" style={styles.inputLabel}>Názov výletu</AccessibleText>
            <TextInput
              style={styles.input}
              placeholder="Zadaj názov výletu"
              placeholderTextColor={theme.thirdText}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
              accessibilityLabel="Názov výletu"
              accessibilityHint="Zadajte názov pre váš výlet"
            />
            
            <AccessibleText variant="body" style={styles.inputLabel}>Popis</AccessibleText>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Zadaj popis výletu"
              placeholderTextColor={theme.thirdText}
              value={description}
              onChangeText={setDescription}
              multiline={true}
              maxLength={200}
              accessibilityLabel="Popis výletu"
              accessibilityHint="Zadajte voliteľný popis vášho výletu"
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
                disabled={isLoading}
                accessibilityLabel="Zrušiť"
                accessibilityRole="button"
              >
                <AccessibleText variant="body" color={theme.text}>Zrušiť</AccessibleText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSave}
                disabled={isLoading}
                accessibilityLabel="Uložiť výlet"
                accessibilityRole="button"
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <AccessibleText variant="body" color="#ffffff">Ulož výlet</AccessibleText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default TripSaveModal;