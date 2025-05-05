import React from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Text, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { API_URL } from '../../../utils/constants';
import { PhotoLocation } from '../../../utils/types';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

const { width } = Dimensions.get('window');

export default function MemoryClusterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const photos: PhotoLocation[] = JSON.parse(params.photos as string);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;  
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoLocation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePhotoPress = (photo: PhotoLocation) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPhoto(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.secondary,
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 16,
      color: theme.text,
    },
    photoItem: {
      width: width / 3,
      height: width / 3,
      padding: 1,
    },
    thumbnail: {
      width: '100%',
      height: '100%',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    modalContent: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      zIndex: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullImage: {
      width: '100%',
      height: '70%',
    },
    photoInfo: {
      width: '100%',
      padding: 16,
      alignItems: 'center',
    },
    description: {
      color: theme.text,
      fontSize: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    dateText: {
      color: theme.secondText,
      fontSize: 14,
      marginBottom: 16,
    },
    tripButton: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    tripButtonText: {
      color: theme.card,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.card} />
        </TouchableOpacity>
        <Text style={styles.title}>Memory Cluster ({photos.length})</Text>
      </View>

      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.photoItem} 
            onPress={() => handlePhotoPress(item)}
          >
            <Image 
              source={{ uri: `${API_URL}${item.photo_url}` }} 
              style={styles.thumbnail}
            />
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons name="close" size={24} color={theme.card} />
            </TouchableOpacity>
            
            {selectedPhoto && (
              <View style={styles.photoContainer}>
                <Image 
                  source={{ uri: `${API_URL}${selectedPhoto.photo_url}` }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                <View style={styles.photoInfo}>
                  {selectedPhoto.description && (
                    <Text style={styles.description}>{selectedPhoto.description}</Text>
                  )}
                  <Text style={styles.dateText}>
                    {formatDate(selectedPhoto.created_at)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.tripButton}
                    onPress={() => {
                      closeModal();
                      router.push({
                        pathname: '/(tabs)/memories',
                        params: { id: selectedPhoto.trip_id }
                      });
                    }}
                  >
                    <Text style={styles.tripButtonText}>View Trip</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
