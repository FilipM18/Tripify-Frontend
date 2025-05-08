import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { API_URL } from '../../../utils/constants';
import { apiService } from '../../../utils/api';
import { PhotoLocation, MemoryCluster } from '../../../utils/types';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { getToken } from '@/utils/auth';

export default function MemoriesScreen() {
  const router = useRouter();
  const { isTablet, width, height } = useScreenDimensions();
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
      //console.log('[fetchAllPhotos] Parsed photo data:', parsedPhotoData);
      setPhotos(parsedPhotoData);
      const clusters = clusterPhotos(parsedPhotoData);
      setMemoryClusters(clusters);
    } catch (error) {
      //console.error('Error fetching photos:', error);
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

  // Group nearby photos to create clusters
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      width: '100%',
      height: '100%',
    },
    markerContainer: {
      alignItems: 'center',
    },
    singleMarker: {
      width: isTablet ? 48 : 36,
      height: isTablet ? 48 : 36,
      borderRadius: isTablet ? 24 : 18,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#4CAF50',
      overflow: 'hidden',
    },
    markerImage: {
      width: isTablet ? 44 : 32,
      height: isTablet ? 44 : 32,
      borderRadius: isTablet ? 22 : 16,
    },
    clusterMarker: {
      width: isTablet ? 48 : 36,
      height: isTablet ? 48 : 36,
      borderRadius: isTablet ? 24 : 18,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'white',
    },
    clusterText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: isTablet ? 16 : 14,
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
      backgroundColor: 'black',
      borderRadius: 10,
      overflow: 'hidden',
    },
    closeButton: {
      position: 'absolute',
      top: isTablet ? 20 : 10,
      right: isTablet ? 20 : 10,
      zIndex: 10,
      width: isTablet ? 48 : 36,
      height: isTablet ? 48 : 36,
      borderRadius: isTablet ? 24 : 18,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
      color: 'white',
      padding: isTablet ? 16 : 10,
      textAlign: 'center',
      fontSize: isTablet ? 18 : 14,
    }
  });

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {memoryClusters.map((cluster, index) => (
          <Marker
            key={index}
            coordinate={cluster.coordinate}
            onPress={() => handleMarkerPress(cluster)}
          >
            <View style={styles.markerContainer}>
              {cluster.photos.length > 1 ? (
                <View style={styles.clusterMarker}>
                  <Text style={styles.clusterText}>{cluster.photos.length}</Text>
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

      {/* Photo preview modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <Ionicons name="close" size={isTablet ? 28 : 24} color="white" />
            </TouchableOpacity>
            
            {selectedMemory && (
              <View style={styles.photoContainer}>
                <Image 
                  source={{ uri: `${API_URL}${selectedMemory.photo_url}` }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                {selectedMemory.description && (
                  <Text style={styles.description}>{selectedMemory.description}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}