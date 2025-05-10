import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

interface EditPasswordFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EditPasswordForm: React.FC<EditPasswordFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { theme, fontScale } = useTheme();
  const { isTablet } = useScreenDimensions();

  const handleSubmit = () => {
    if (!currentPassword || !newPassword) {
      alert('Prosím, vyplňte všetky polia!');
      return;
    }
    onSubmit(currentPassword, newPassword);
  };

  const styles = useScaledStyles((scale) => ({
    container: { 
      padding: isTablet ? 24 * Math.sqrt(scale) : 16 * Math.sqrt(scale), 
      backgroundColor: theme.secondBackground,
      borderRadius: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
    },
    formSection: {
      marginBottom: isTablet ? 24 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
    },
    label: { 
      fontSize: isTablet ? 16 * scale : 14 * scale, 
      fontWeight: '500', 
      marginBottom: isTablet ? 8 * Math.sqrt(scale) : 6 * Math.sqrt(scale), 
      color: theme.text,
    },
    input: { 
      borderWidth: 1, 
      borderColor: theme.border, 
      borderRadius: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale), 
      paddingHorizontal: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale), 
      paddingVertical: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale), 
      fontSize: isTablet ? 18 * scale : 16 * scale, 
      marginBottom: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      color: theme.text,
    },
    buttonRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between',
      marginTop: isTablet ? 8 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
    },
    cancelButton: { 
      backgroundColor: theme.secondBackground, 
      borderRadius: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale), 
      paddingVertical: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale), 
      paddingHorizontal: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: isTablet ? 120 * Math.sqrt(scale) : 100 * Math.sqrt(scale),
    },
    cancelText: { 
      color: theme.text, 
      fontWeight: '500', 
      fontSize: isTablet ? 16 * scale : 14 * scale,
    },
    submitButton: { 
      backgroundColor: theme.primary, 
      borderRadius: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale), 
      paddingVertical: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale), 
      paddingHorizontal: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale), 
      alignItems: 'center', 
      justifyContent: 'center',
      marginLeft: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      minWidth: isTablet ? 120 * Math.sqrt(scale) : 100 * Math.sqrt(scale),
    },
    submitText: { 
      color: '#fff', 
      fontWeight: '600', 
      fontSize: isTablet ? 16 * scale : 14 * scale,
    },
    disabledButton: {
      opacity: 0.7,
    },
  }));

  return (
    <View 
      style={styles.container}
      accessibilityLabel="Zmena hesla formulár"
    >
      <View style={styles.formSection}>
        <AccessibleText variant="bodyBold" style={styles.label}>
          Heslo
        </AccessibleText>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Zadaj aktuálne heslo"
          placeholderTextColor={theme.secondText}
          secureTextEntry
          accessibilityLabel="Pole pre aktuálne heslo"
          accessibilityHint="Zadajte vaše aktuálne heslo pre overenie totožnosti"
        />
      </View>

      <View style={styles.formSection}>
        <AccessibleText variant="bodyBold" style={styles.label}>
          Nové heslo
        </AccessibleText>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Zadaj nové heslo"
          placeholderTextColor={theme.secondText}
          secureTextEntry
          accessibilityLabel="Pole pre nové heslo"
          accessibilityHint="Zadajte nové heslo, ktoré chcete používať"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.cancelButton, isSubmitting && styles.disabledButton]} 
          onPress={onCancel} 
          disabled={isSubmitting}
          accessibilityLabel="Zrušiť zmenu hesla"
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
        >
          <AccessibleText variant="body" style={styles.cancelText}>
            Zrušiť
          </AccessibleText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
          onPress={handleSubmit} 
          disabled={isSubmitting}
          accessibilityLabel="Potvrdiť zmenu hesla"
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
          accessibilityHint="Uloží nové heslo"
        >
          {isSubmitting ? (
            <ActivityIndicator 
              color="#fff" 
              accessibilityLabel="Prebieha zmena hesla" 
            />
          ) : (
            <AccessibleText variant="bodyBold" style={styles.submitText}>
              Zmeň heslo
            </AccessibleText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditPasswordForm;