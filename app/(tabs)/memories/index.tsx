import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { API_URL } from '../../../utils/constants';
import { apiService } from '../../../utils/api';
import { PhotoLocation, MemoryCluster } from '../../../utils/types';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { getToken } from '@/utils/auth';
import { useTheme } from '@/app/ThemeContext';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

export default function MemoriesScreen() {
  const router = useRouter();
  const { isTablet, width, height } = useScreenDimensions();
  const { theme, visionMode } = useTheme();
  const [region, setRegion] = useState({
    latitude: 48.1486, // Default: Bratislava
    longitude: 17.1077,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [photos, setPhotos] = useState<PhotoLocation[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<PhotoLocation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [memoryClusters, setMemoryClusters] = useState<MemoryCluster[]>([]);

  const fetchAllPhotos = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }
      
      const photoData = await apiService.getAllGeoPhotos();
      const parsedPhotoData = photoData.map(photo => ({
        ...photo,
        latitude: typeof photo.latitude === 'string' ? parseFloat(photo.latitude) : photo.latitude,
        longitude: typeof photo.longitude === 'string' ? parseFloat(photo.longitude) : photo.longitude,
      }));
      setPhotos(parsedPhotoData);
      const clusters = clusterPhotos(parsedPhotoData);
      setMemoryClusters(clusters);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setErrorMsg('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }

      fetchAllPhotos();
    })();
  }, []);

  const clusterPhotos = (photoList: PhotoLocation[], radius: number = 0.005): MemoryCluster[] => {
    if (!photoList.length) return [];
    
    const clusters: MemoryCluster[] = [];
    const processedPhotos = new Set<number>();
    
    photoList.forEach((photo) => {
      if (processedPhotos.has(photo.id)) return;
      
      const cluster: MemoryCluster = {
        coordinate: {
          latitude: photo.latitude,
          longitude: photo.longitude
        },
        photos: [photo]
      };
      
      processedPhotos.add(photo.id);
      photoList.forEach((nearbyPhoto) => {
        if (
          nearbyPhoto.id !== photo.id && 
          !processedPhotos.has(nearbyPhoto.id) &&
          calculateDistance(photo, nearbyPhoto) <= radius
        ) {
          cluster.photos.push(nearbyPhoto);
          processedPhotos.add(nearbyPhoto.id);
        }
      });
      
      clusters.push(cluster);
    });
    
    return clusters;
  };

  const calculateDistance = (point1: PhotoLocation, point2: PhotoLocation): number => {
    const latDiff = point1.latitude - point2.latitude;
    const lngDiff = point1.longitude - point2.longitude;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  };

  const handleMarkerPress = (cluster: MemoryCluster) => {
    if (cluster.photos.length === 1) {
      setSelectedMemory(cluster.photos[0]);
      setModalVisible(true);
    } else {
      router.push({
        pathname: '/(tabs)/memories/cluster',
        params: { photos: JSON.stringify(cluster.photos) }
      });
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedMemory(null);
  };
  
  const getMarkerAccessibilityLabel = (cluster: MemoryCluster) => {
    if (cluster.photos.length === 1) {
      const photo = cluster.photos[0];
      return photo.description 
        ? `Fotografia: ${photo.description}` 
        : 'Fotografia na mape';
    } else {
      return `Skupina ${cluster.photos.length} fotografií`;
    }
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      flex: 1,
    },
    map: {
      width: '100%',
      height: '100%',
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    errorText: {
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: 16 * Math.sqrt(scale),
      position: 'absolute',
      top: 50 * Math.sqrt(scale),
      left: 20 * Math.sqrt(scale),
      right: 20 * Math.sqrt(scale),
      borderRadius: 8 * Math.sqrt(scale),
    },
    markerContainer: {
      alignItems: 'center',
    },
    singleMarker: {
      width: isTablet ? 48 * Math.sqrt(scale) : 36 * Math.sqrt(scale),
      height: isTablet ? 48 * Math.sqrt(scale) : 36 * Math.sqrt(scale),
      borderRadius: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.primary,
      overflow: 'hidden',
    },
    markerImage: {
      width: isTablet ? 44 * Math.sqrt(scale) : 32 * Math.sqrt(scale),
      height: isTablet ? 44 * Math.sqrt(scale) : 32 * Math.sqrt(scale),
      borderRadius: isTablet ? 22 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
    },
    clusterMarker: {
      width: isTablet ? 48 * Math.sqrt(scale) : 36 * Math.sqrt(scale),
      height: isTablet ? 48 * Math.sqrt(scale) : 36 * Math.sqrt(scale),
      borderRadius: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'white',
    },
    clusterText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: isTablet ? 16 * scale : 14 * scale,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalContent: {
      width: isTablet ? width * 0.7 : width * 0.9,
      height: isTablet ? height * 0.8 : height * 0.7,
      backgroundColor: theme.card,
      borderRadius: 10 * Math.sqrt(scale),
      overflow: 'hidden',
    },
    closeButton: {
      position: 'absolute',
      top: isTablet ? 20 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      right: isTablet ? 20 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullImage: {
      width: '100%',
      height: isTablet ? '80%' : '90%',
    },
    description: {
      padding: isTablet ? 16 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      textAlign: 'center',
      fontSize: isTablet ? 18 * scale : 14 * scale,
    }
  }));

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        accessibilityLabel="Mapa spomienok"
      >
        {memoryClusters.map((cluster, index) => (
          <Marker
            key={index}
            coordinate={cluster.coordinate}
            onPress={() => handleMarkerPress(cluster)}
            accessibilityLabel={getMarkerAccessibilityLabel(cluster)}
          >
            <View style={styles.markerContainer}>
              {cluster.photos.length > 1 ? (
                <View style={styles.clusterMarker}>
                  <AccessibleText 
                    variant="bodyBold"
                    color="white"
                    style={styles.clusterText}
                  >
                    {cluster.photos.length}
                  </AccessibleText>
                </View>
              ) : (
                <View style={styles.singleMarker}>
                  <Image 
                    source={{ uri: `${API_URL}${cluster.photos[0].photo_url}` }} 
                    style={styles.markerImage} 
                  />
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={theme.primary} 
            accessibilityLabel="Načítavanie fotografií"
          />
        </View>
      )}

      {errorMsg !== '' && (
        <AccessibleText 
          variant="body"
          style={styles.errorText}
          accessibilityLabel={`Chyba: ${errorMsg}`}
        >
          {errorMsg}
        </AccessibleText>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleCloseModal}
              accessibilityLabel="Zavrieť detail"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={isTablet ? 28 : 24} color="white" />
            </TouchableOpacity>
            
            {selectedMemory && (
              <View 
                style={styles.photoContainer}
                accessibilityLabel={selectedMemory.description 
                  ? `Detail fotografie: ${selectedMemory.description}` 
                  : "Detail fotografie"}
              >
                <Image 
                  source={{ uri: `${API_URL}${selectedMemory.photo_url}` }}
                  style={styles.fullImage}
                  resizeMode="contain"
                  accessibilityLabel="Fotografia vo veľkom náhľade"
                />
                {selectedMemory.description && (
                  <AccessibleText 
                    variant="body"
                    color={theme.text}
                    style={styles.description}
                  >
                    {selectedMemory.description}
                  </AccessibleText>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}