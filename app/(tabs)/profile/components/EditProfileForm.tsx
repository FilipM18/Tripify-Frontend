import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
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
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

interface EditProfileFormProps {
  userProfile: UserProfile;
  onSubmit: (formData: FormData) => void;
  onPasswordChangeRequest: () => void;
  isSubmitting: boolean;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  userProfile,
  onSubmit,
  onPasswordChangeRequest,
  isSubmitting
}) => {
  const [username, setUsername] = useState(userProfile.username);
  const [email, setEmail] = useState(userProfile.email);
  const [phoneNumber, setPhoneNumber] = useState(userProfile.tel_num || '');
  const [profileImage, setProfileImage] = useState<string | null>(
    userProfile.photo_url ? `${API_URL}${userProfile.photo_url}` : null
  );
  const [imageFile, setImageFile] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
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
    formData.append('userId', userProfile.id);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    
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

  const styles = StyleSheet.create({
    container: {
      padding: isTablet ? 24 : 16,
      backgroundColor: theme.secondBackground,
    },
    imageSection: {
      alignItems: 'center',
      marginBottom: isTablet ? 32 : 24,
    },
    imageContainer: {
      position: 'relative', 
      marginBottom: isTablet ? 12 : 8,
    },
    profileImage: {
      width: isTablet ? 160 : 120,
      height: isTablet ? 160 : 120,
      borderRadius: isTablet ? 80 : 60,
    },
    placeholderImage: {
      width: isTablet ? 160 : 120,
      height: isTablet ? 160 : 120,
      borderRadius: isTablet ? 80 : 60,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editImageButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.primary,
      borderRadius: isTablet ? 20 : 15,
      width: isTablet ? 40 : 30,
      height: isTablet ? 40 : 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.border,
    },
    formSection: {
      marginBottom: isTablet ? 32 : 24,
    },
    inputGroup: {
      marginBottom: isTablet ? 24 : 16,
    },
    label: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: '500',
      marginBottom: isTablet ? 8 : 6,
      color: theme.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 14 : 10,
      fontSize: isTablet ? 18 : 16,
      color: theme.secondText,
    },
    passwordButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: isTablet ? 16 : 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    passwordButtonText: {
      fontSize: isTablet ? 18 : 16,
      color: theme.primary,
      fontWeight: '500',
    },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: isTablet ? 12 : 8,
      paddingVertical: isTablet ? 18 : 14,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: '#A5D6A7',
    },
    submitButtonText: {
      color: theme.text,
      fontSize: isTablet ? 18 : 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageSection}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="person" size={isTablet ? 60 : 40} color={theme.secondText} />
            </View>
          )}
          <View style={styles.editImageButton}>
            <Ionicons name="camera" size={isTablet ? 24 : 18} color={theme.card} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Zadaj username"
            placeholderTextColor={theme.secondText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Zadaj email"
            placeholderTextColor={theme.secondText}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tel. číslo</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Zadaj tel. číslo (optional)"
            placeholderTextColor={theme.secondText}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.passwordButton}
          onPress={onPasswordChangeRequest}
        >
          <Text style={styles.passwordButtonText}>Zmeň heslo</Text>
          <Ionicons name="chevron-forward" size={isTablet ? 22 : 18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size={isTablet ? "large" : "small"} />
        ) : (
          <Text style={styles.submitButtonText}>Ulož zmeny</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileForm;