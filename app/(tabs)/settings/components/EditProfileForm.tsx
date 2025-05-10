import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/utils/constants';
import { UserProfile } from '@/utils/types';
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

interface EditProfileFormProps {
  userProfile: UserProfile;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  userProfile,
  onCancel,
  onSubmit,
  isSubmitting
}) => {
  const [username, setUsername] = useState(userProfile.username);
  const [email, setEmail] = useState(userProfile.email);
  const [phoneNumber, setPhoneNumber] = useState(userProfile.tel_num || '');
  const [profileImage, setProfileImage] = useState<string | null>(
    userProfile.photo_url ? `${API_URL}${userProfile.photo_url}` : null
  );
  const [imageFile, setImageFile] = useState<string | null>(null);
  const { theme } = useTheme();
  const { isTablet } = useScreenDimensions();

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        setImageFile(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to select image.');
    }
  };

  const handleSubmit = () => {
    if (!username.trim()) {
      alert('Username is required');
      return;
    }
    
    if (!email.trim()) {
      alert('Email is required');
      return;
    }
    
    if (phoneNumber && phoneNumber.length !== 10 && phoneNumber.length !== 0) {
      alert('Phone number must be 10 digits');
      return;
    }
  
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    if (phoneNumber && phoneNumber.trim() !== '') {
      formData.append('phoneNumber', phoneNumber);
    }

    [...formData.entries()].forEach(([key, value]) => {
      if (value === '' || value === 'null' || value === 'undefined') {
        formData.delete(key);
      }
    });
    if (imageFile) {
      const filename = imageFile.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('pfp', {
        uri: imageFile,
        name: filename,
        type,
      } as any);
    }
    onSubmit(formData);
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      padding: isTablet ? 24 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      backgroundColor: theme.secondBackground,
      borderRadius: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
    },
    imageSection: {
      alignItems: 'center',
      marginBottom: isTablet ? 32 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
    },
    imageContainer: {
      position: 'relative', 
      marginBottom: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    profileImage: {
      width: isTablet ? 160 * Math.sqrt(scale) : 120 * Math.sqrt(scale),
      height: isTablet ? 160 * Math.sqrt(scale) : 120 * Math.sqrt(scale),
      borderRadius: isTablet ? 80 * Math.sqrt(scale) : 60 * Math.sqrt(scale),
    },
    placeholderImage: {
      width: isTablet ? 160 * Math.sqrt(scale) : 120 * Math.sqrt(scale),
      height: isTablet ? 160 * Math.sqrt(scale) : 120 * Math.sqrt(scale),
      borderRadius: isTablet ? 80 * Math.sqrt(scale) : 60 * Math.sqrt(scale),
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editImageButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.primary,
      borderRadius: isTablet ? 20 * Math.sqrt(scale) : 15 * Math.sqrt(scale),
      width: isTablet ? 40 * Math.sqrt(scale) : 30 * Math.sqrt(scale),
      height: isTablet ? 40 * Math.sqrt(scale) : 30 * Math.sqrt(scale),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.border,
    },
    formSection: {
      marginBottom: isTablet ? 32 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
    },
    inputGroup: {
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
      color: theme.text,
    },
    passwordButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    passwordButtonText: {
      fontSize: isTablet ? 18 * scale : 16 * scale,
      color: theme.primary,
      fontWeight: '500',
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
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      paddingVertical: isTablet ? 18 * Math.sqrt(scale) : 14 * Math.sqrt(scale),
      paddingHorizontal: isTablet ? 24 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: isTablet ? 140 * Math.sqrt(scale) : 120 * Math.sqrt(scale),
    },
    disabledButton: {
      opacity: 0.7,
    },
    cancelText: { 
      color: theme.text, 
      fontWeight: '500', 
      fontSize: isTablet ? 16 * scale : 14 * scale,
    },
    submitText: { 
      color: '#fff', 
      fontWeight: '600', 
      fontSize: isTablet ? 16 * scale : 14 * scale,
    },
  }));

  return (
    <View 
      style={styles.container}
      accessibilityLabel="Úprava profilu formulár"
    >
      <View 
        style={styles.imageSection}
        accessibilityLabel="Sekcia pre úpravu profilovej fotografie"
      >
        <TouchableOpacity 
          onPress={pickImage} 
          style={styles.imageContainer}
          accessibilityLabel="Zmeniť profilovú fotografiu"
          accessibilityRole="button"
          accessibilityHint="Stlačením vyberiete novú profilovú fotografiu z galérie"
        >
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.profileImage}
              accessibilityLabel="Profilová fotografia"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons 
                name="person" 
                size={isTablet ? 60 : 40} 
                color={theme.secondText}
              />
            </View>
          )}
          <View style={styles.editImageButton}>
            <Ionicons 
              name="camera" 
              size={isTablet ? 24 : 18} 
              color={theme.card}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View 
        style={styles.formSection}
        accessibilityLabel="Formulár pre úpravu osobných údajov"
      >
        <View style={styles.inputGroup}>
          <AccessibleText variant="bodyBold" style={styles.label}>
            Username
          </AccessibleText>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Zadaj username"
            placeholderTextColor={theme.secondText}
            accessibilityLabel="Pole pre užívateľské meno"
            accessibilityHint="Zadajte vaše nové užívateľské meno"
          />
        </View>

        <View style={styles.inputGroup}>
          <AccessibleText variant="bodyBold" style={styles.label}>
            Email
          </AccessibleText>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Zadaj email"
            placeholderTextColor={theme.secondText}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Pole pre email"
            accessibilityHint="Zadajte vašu emailovú adresu"
          />
        </View>

        <View style={styles.inputGroup}>
          <AccessibleText variant="bodyBold" style={styles.label}>
            Tel. číslo
          </AccessibleText>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Zadaj tel. číslo (optional)"
            placeholderTextColor={theme.secondText}
            keyboardType="phone-pad"
            maxLength={10}
            accessibilityLabel="Pole pre telefónne číslo (voliteľné)"
            accessibilityHint="Zadajte vaše telefónne číslo bez medzinárodnej predvoľby"
          />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.cancelButton, isSubmitting && styles.disabledButton]} 
          onPress={onCancel} 
          disabled={isSubmitting}
          accessibilityLabel="Zrušiť úpravy"
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
          accessibilityLabel="Uložiť zmeny profilu"
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
          accessibilityHint="Potvrdí a uloží zmeny profilu"
        >
          {isSubmitting ? (
            <ActivityIndicator 
              color="#fff" 
              accessibilityLabel="Prebieha ukladanie zmien" 
            />
          ) : (
            <AccessibleText variant="bodyBold" style={styles.submitText}>
              Ulož zmeny
            </AccessibleText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfileForm;