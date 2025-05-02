// hooks/useTrip.ts - Fixed Version
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../../../../utils/api';
import { getToken } from '../../../../utils/auth';
import { Alert } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface PhotoUpload {
  uri: string;
  latitude: number;
  longitude: number;
  uploaded: boolean;
  id?: number;
}

export function useTrip() {
  const [route, setRoute] = useState<LocationCoordinates[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [selectedActivity, setSelectedActivity] = useState('running');
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  
  const locationSubscription = useRef<any>(null);
  const timerInterval = useRef<any>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await getToken();
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserId(payload.id);
        }
      } catch (error) {
        console.error('Failed to get user ID:', error);
      }
    };
    
    getUserId();
  }, []);

  // Location permission and initial setup
  useEffect(() => {
    const getInitialLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });
          
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp
          });
        } else {
          Alert.alert('Permission Required', 'Location permission is needed to record your trip.');
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
    
    getInitialLocation();
    
    return () => cleanupSubscriptions();
  }, []);

  // Recording effect
  useEffect(() => {
    if (isRecording) {
      startLocationTracking();
      startTimer();
    } else {
      cleanupSubscriptions();
    }
    
    return () => cleanupSubscriptions();
  }, [isRecording]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const cleanupSubscriptions = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const startLocationTracking = async () => {
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced, 
          timeInterval: 2000, 
          distanceInterval: 1, 
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const timestamp = location.timestamp;
          
          setCurrentLocation({
            latitude,
            longitude,
            timestamp
          });
          
          setRoute((prevRoute) => {
            if (prevRoute.length > 0) {
              const prevPoint = prevRoute[prevRoute.length - 1];
              const distance = calculateDistance(
                prevPoint.latitude,
                prevPoint.longitude,
                latitude,
                longitude
              );
              
              if (distance > 0) {
                setTotalDistance((prev) => prev + distance);
                const timeElapsed = (timestamp - prevPoint.timestamp) / 1000 / 3600;
                if (timeElapsed > 0) {
                  setPace(distance / timeElapsed);
                }
              }
            }
            
            return [...prevRoute, { latitude, longitude, timestamp }];
          });
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start location tracking. Please try again.');
    }
  };

  const startTimer = () => {
    timerInterval.current = setInterval(() => {
      if (startTime) {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
  };

  const startRecording = async () => {
    if (!userId) {
      Alert.alert('Error', 'User is not authenticated. Please log in again.');
      return;
    }
    
    setRoute([]);
    setTotalDistance(0);
    setPace(0);
    setDuration(0);
    setStartTime(Date.now());
    setIsRecording(true);
    setPhotos([]);
  };

  const stopRecording = async () => {
    if (uploadInProgress) {
      Alert.alert('Upload in Progress', 'Please wait for the current upload to complete.');
      return;
    }
    
    setIsRecording(false);
    
    if (!userId) {
      Alert.alert('Error', 'User is not authenticated. Please log in again.');
      return;
    }
    
    if (route.length < 2) {
      Alert.alert('Not enough data', 'Your trip is too short to save.');
      return;
    }
    
    setUploadInProgress(true);
    
    try {
      const tripData = {
        userId: userId,
        startedAt: new Date(startTime!).toISOString(),
        endedAt: new Date().toISOString(),
        distanceKm: totalDistance,
        durationSeconds: duration,
        averagePace: pace,
        route: route.map(({ latitude, longitude }) => ({ latitude, longitude })),
        type: selectedActivity,
      };
      
      const result = await apiService.createTrip(tripData);
      
      if (result && result.success) {
        setTripId(result.tripId);
        
        // Upload photos one by one (not all at once)
        if (photos.length > 0) {
          for (const photo of photos) {
            if (!photo.uploaded) {
              try {
                await uploadPhoto(photo, result.tripId);
              } catch (err) {
                console.error('Failed to upload photo:', err);
              }
            }
          }
        }
        
        Alert.alert('Success', 'Trip saved successfully!');
      } else {
        throw new Error('Failed to create trip');
      }
    } catch (error) {
      console.error('Failed to save trip:', error);
      Alert.alert('Error', 'Failed to save trip. Please try again.');
    } finally {
      setUploadInProgress(false);
    }
  };

  const takePhoto = async () => {
    if (!isRecording || !currentLocation) return;
    if (!userId) {
      Alert.alert('Error', 'User is not authenticated. Please log in again.');
      return;
    }
    
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted) {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false, 
          quality: 0.5, // Reduced from 1 to 0.7 to save memory
          exif: false, 
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const newPhoto: PhotoUpload = {
            uri: result.assets[0].uri,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            uploaded: false,
          };
          
          setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
          
          if (tripId) {
            await uploadPhoto(newPhoto, tripId);
          }
        }
      } else {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadPhoto = async (photo: PhotoUpload, tripId: string): Promise<void> => {
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    
    try {
      const result = await apiService.uploadTripPhoto({
        tripId, 
        userId: userId,
        uri: photo.uri,
        latitude: photo.latitude,
        longitude: photo.longitude
      });
      
      if (result && result.success && result.photo) {
        setPhotos(prev => 
          prev.map(p => p.uri === photo.uri ? { ...p, uploaded: true, id: result.photo.id } : p)
        );
      } else {
        throw new Error('Upload response invalid');
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      throw error; 
    }
  };

  return {
    route,
    currentLocation,
    totalDistance,
    pace,
    duration,
    isRecording,
    photos,
    selectedActivity,
    startRecording,
    stopRecording,
    takePhoto,
    setSelectedActivity,
  };
}