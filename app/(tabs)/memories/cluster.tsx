import React, { useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_URL } from '../../../utils/constants';
import { PhotoLocation } from '../../../utils/types';
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

export default function MemoryClusterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const photos: PhotoLocation[] = JSON.parse(params.photos as string);
  const { theme } = useTheme();
  const { isTablet, width } = useScreenDimensions();
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.secondary,
    },
    backButton: {
      padding: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    title: {
      fontSize: isTablet ? 22 * scale : 18 * scale,
      fontWeight: 'bold',
      marginLeft: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      color: theme.text,
    },
    photoItem: {
      width: isTablet ? width / 4 : width / 3,
      height: isTablet ? width / 4 : width / 3,
      padding: 1 * Math.sqrt(scale),
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
      top: isTablet ? 50 * Math.sqrt(scale) : 40 * Math.sqrt(scale),
      right: isTablet ? 30 * Math.sqrt(scale) : 20 * Math.sqrt(scale),
      zIndex: 10,
      width: isTablet ? 48 * Math.sqrt(scale) : 36 * Math.sqrt(scale),
      height: isTablet ? 48 * Math.sqrt(scale) : 36 * Math.sqrt(scale),
      borderRadius: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
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
      width: isTablet ? '90%' : '100%',
      height: isTablet ? '70%' : '70%',
    },
    photoInfo: {
      width: isTablet ? '80%' : '100%',
      padding: isTablet ? 24 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      alignItems: 'center',
    },
    description: {
      fontSize: isTablet ? 18 * scale : 16 * scale,
      marginBottom: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      textAlign: 'center',
    },
    dateText: {
      fontSize: isTablet ? 16 * scale : 14 * scale,
      marginBottom: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
    },
    tripButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: isTablet ? 24 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      paddingVertical: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      borderRadius: 20 * Math.sqrt(scale),
    },
    tripButtonText: {
      color: theme.card,
      fontWeight: 'bold',
      fontSize: isTablet ? 16 * scale : 14 * scale,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          accessibilityLabel="Späť"
          accessibilityRole="button"
          accessibilityHint="Návrat na predchádzajúcu obrazovku"
        >
          <Ionicons name="arrow-back" size={24} color={theme.card} />
        </TouchableOpacity>
        <AccessibleText 
          variant="header2" 
          style={styles.title}
        >
          Memory Cluster ({photos.length})
        </AccessibleText>
      </View>

      <FlatList
        data={photos}
        numColumns={isTablet ? 4 : 3}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.photoItem} 
            onPress={() => handlePhotoPress(item)}
            accessibilityLabel={item.description ? 
              `Fotografia: ${item.description}, ${formatDate(item.created_at)}` : 
              `Fotografia z ${formatDate(item.created_at)}`}
            accessibilityRole="image"
            accessibilityHint="Kliknutím zobrazíte detail fotografie"
          >
            <Image 
              source={{ uri: `${API_URL}${item.photo_url}` }} 
              style={styles.thumbnail}
            />
          </TouchableOpacity>
        )}
        accessibilityLabel={`Galéria fotografií, ${photos.length} fotografií`}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeModal}
              accessibilityLabel="Zavrieť detail"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={theme.card} />
            </TouchableOpacity>
            
            {selectedPhoto && (
              <View 
                style={styles.photoContainer}
                accessibilityLabel={selectedPhoto.description ? 
                  `Detailný pohľad na fotografiu: ${selectedPhoto.description}, vytvorená ${formatDate(selectedPhoto.created_at)}` : 
                  `Detailný pohľad na fotografiu z ${formatDate(selectedPhoto.created_at)}`}
              >
                <Image 
                  source={{ uri: `${API_URL}${selectedPhoto.photo_url}` }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                <View style={styles.photoInfo}>
                  {selectedPhoto.description && (
                    <AccessibleText 
                      variant="body" 
                      color={theme.text}
                      style={styles.description}
                    >
                      {selectedPhoto.description}
                    </AccessibleText>
                  )}
                  <AccessibleText 
                    variant="caption" 
                    color={theme.secondText}
                    style={styles.dateText}
                  >
                    {formatDate(selectedPhoto.created_at)}
                  </AccessibleText>
                  <TouchableOpacity 
                    style={styles.tripButton}
                    onPress={() => {
                      closeModal();
                      router.push({
                        pathname: '/(tabs)/memories',
                        params: { id: selectedPhoto.trip_id }
                      });
                    }}
                    accessibilityLabel="Zobraziť výlet"
                    accessibilityRole="button"
                    accessibilityHint="Zobrazí súvisiaci výlet"
                  >
                    <AccessibleText 
                      variant="bodyBold" 
                      color={theme.card}
                      style={styles.tripButtonText}
                    >
                      View Trip
                    </AccessibleText>
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