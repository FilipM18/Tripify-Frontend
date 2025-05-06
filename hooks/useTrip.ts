import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../utils/api';
import { getToken } from '../utils/auth';
import { Alert, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

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

interface TripData {
  userId: string;
  startedAt: string;
  endedAt: string;
  distanceKm: number;
  durationSeconds: number;
  averagePace: number;
  route: { latitude: number; longitude: number }[];
  type: string;
  title?: string;
  info?: string;
}

interface PendingTrip {
  tripData: TripData;
  photos: PhotoUpload[];
  tripId?: string;
  transactionId?: string;
}

const PENDING_TRIPS_KEY = 'pending_trips';
const AUTO_SYNC_DELAY = 3000; // Delay before auto-syncing to avoid rapid attempts

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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasPendingTrips, setHasPendingTrips] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const locationSubscription = useRef<any>(null);
  const timerInterval = useRef<any>(null);
  const appState = useRef(AppState.currentState);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // IMPORTANT: Define uploadPhoto function before it's used in syncPendingTrips
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

  // Memoize syncPendingTrips to avoid recreating it on each render
  const syncPendingTrips = useCallback(async () => {
    console.log('[syncPendingTrips] Function called');
    
    // Check network state before proceeding
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.log('[syncPendingTrips] Device is currently offline. Sync aborted.');
      return;
    }
    
    // Prevent concurrent sync operations
    if (isSyncing) {
      console.log('[syncPendingTrips] Sync already in progress. Skipping.');
      return;
    }
    
    try {
      setIsSyncing(true);
      console.log('[syncPendingTrips] Starting sync process...');
      
      const pendingTripsJson = await AsyncStorage.getItem(PENDING_TRIPS_KEY);
      if (!pendingTripsJson) {
        console.log('[syncPendingTrips] No pending trips found.');
        setIsSyncing(false);
        return;
      }
      
      const pendingTrips: PendingTrip[] = JSON.parse(pendingTripsJson);
      if (pendingTrips.length === 0) {
        console.log('[syncPendingTrips] Pending trips array is empty.');
        setIsSyncing(false);
        return;
      }
      
      // Don't show alert on automatic syncing
      // Alert.alert('Syncing', `Syncing ${pendingTrips.length} pending trips...`);
      
      // Process each trip one by one
      const updatedPendingTrips: PendingTrip[] = [];
      
      for (const pendingTrip of pendingTrips) {
        // Skip if already synced (has tripId and all photos uploaded)
        if (pendingTrip.tripId && pendingTrip.photos.every(p => p.uploaded)) {
          console.log(`[syncPendingTrips] Trip ${pendingTrip.tripId} already fully synced. Skipping.`);
          continue;
        }
        
        try {
          // If this trip already has an ID, it was partially synced
          if (pendingTrip.tripId) {
            console.log(`[syncPendingTrips] Trip ${pendingTrip.tripId} partially synced. Uploading remaining photos.`);
            
            // Just upload remaining photos
            let allPhotosUploaded = true;
            
            for (const photo of pendingTrip.photos) {
              if (!photo.uploaded) {
                try {
                  await uploadPhoto(photo, pendingTrip.tripId);
                } catch (err) {
                  console.error('Failed to upload photo:', err);
                  allPhotosUploaded = false;
                }
              }
            }
            
            // If some photos failed, keep this trip in the pending list
            if (!allPhotosUploaded) {
              updatedPendingTrips.push(pendingTrip);
            }
          } else {
            // Create the trip first
            console.log(`[syncPendingTrips] Creating new trip with transaction ID: ${pendingTrip.transactionId}`);
            const result = await apiService.createTrip(pendingTrip.tripData);
            
            if (result && result.success) {
              const tripId = result.tripId;
              pendingTrip.tripId = tripId;
              
              // Upload photos one by one
              let allPhotosUploaded = true;
              
              for (const photo of pendingTrip.photos) {
                try {
                  await uploadPhoto(photo, tripId);
                } catch (err) {
                  console.error('Failed to upload photo:', err);
                  allPhotosUploaded = false;
                }
              }
              
              // If some photos failed, keep this trip in the pending list
              if (!allPhotosUploaded) {
                updatedPendingTrips.push(pendingTrip);
              }
            } else {
              // If trip creation failed, keep in the pending list
              updatedPendingTrips.push(pendingTrip);
            }
          }
        } catch (error) {
          console.error('Error syncing trip:', error);
          updatedPendingTrips.push(pendingTrip);
        }
      }
      
      // Update the pending trips list
      await AsyncStorage.setItem(PENDING_TRIPS_KEY, JSON.stringify(updatedPendingTrips));
      setHasPendingTrips(updatedPendingTrips.length > 0);
      
      // Notify user only if they initiated the sync manually or if something was actually synced
      const syncedCount = pendingTrips.length - updatedPendingTrips.length;
      if (syncedCount > 0) {
        Alert.alert('Sync Complete', `Successfully synced ${syncedCount} trips.`);
      }
      
      console.log(`[syncPendingTrips] Sync completed. Synced: ${syncedCount}, Remaining: ${updatedPendingTrips.length}`);
    } catch (error) {
      console.error('Error syncing pending trips:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, userId]); // Add all dependencies

  // Enhanced network monitoring with automatic sync
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      console.log('[NetworkState]', state.isConnected ? 'Connected' : 'Disconnected');
      
      // Check current offline state before updating
      const wasOffline = isOffline;
      setIsOffline(!state.isConnected);
      
      // When we reconnect to the internet, auto-sync pending trips
      if (wasOffline && state.isConnected) {
        console.log('[NetworkChange] Reconnected to internet, automatically syncing');
        
        // Use a delay to avoid multiple rapid triggers
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        
        syncTimeoutRef.current = setTimeout(() => {
          console.log('[NetworkChange] Executing auto-sync after reconnect');
          // No need to check for pending trips first - the syncPendingTrips function 
          // will check internally and only proceed if there are pending trips
          if (!isRecording) { // Only auto-sync if not recording
            syncPendingTrips();
          } else {
            console.log('[NetworkChange] Not auto-syncing because recording is in progress');
          }
        }, AUTO_SYNC_DELAY);
      }
    });
    
    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [isOffline, isRecording, syncPendingTrips]);

  // Auto-sync when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [isOffline, isSyncing, isRecording, syncPendingTrips]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) && 
      nextAppState === 'active' && 
      !isOffline && 
      !isSyncing && 
      !isRecording
    ) {
      // Auto-sync when app comes to foreground and we're not recording
      console.log('[AppState] App came to foreground, checking for pending trips');
      
      // Add a delay to prevent multiple triggers
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      syncTimeoutRef.current = setTimeout(() => {
        syncPendingTrips();
      }, 1000);
    }
    
    appState.current = nextAppState;
  };

  // Check for pending trips on mount and sync automatically if needed
  useEffect(() => {
    const initialCheck = async () => {
      console.log('[InitialCheck] Running initial pending trips check');
      const hasPending = await checkPendingTrips();
      
      // Auto-sync on initial mount if there are pending trips and we're online
      const networkState = await NetInfo.fetch();
      console.log(`[InitialCheck] Network connected: ${networkState.isConnected}, Has pending: ${hasPending}`);
      
      if (networkState.isConnected && hasPending) {
        console.log('[InitialCheck] Triggering auto-sync');
        // Use a delay to ensure all state is properly initialized
        setTimeout(() => {
          syncPendingTrips();
        }, AUTO_SYNC_DELAY);
      }
    };
    
    initialCheck();

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [syncPendingTrips]);

  // Auto-sync when recording stops and there are pending trips
  useEffect(() => {
    if (!isRecording && hasPendingTrips && !isOffline && !isSyncing) {
      console.log('[RecordingStatus] Recording stopped, auto-syncing pending trips');
      // Add a delay to ensure everything is saved properly
      setTimeout(() => {
        syncPendingTrips();
      }, AUTO_SYNC_DELAY);
    }
  }, [isRecording, hasPendingTrips, isOffline, isSyncing, syncPendingTrips]);

  const checkPendingTrips = async (): Promise<boolean> => {
    try {
      const pendingTripsJson = await AsyncStorage.getItem(PENDING_TRIPS_KEY);
      const pendingTrips = pendingTripsJson ? JSON.parse(pendingTripsJson) : [];
      const hasPending = pendingTrips.length > 0;
      setHasPendingTrips(hasPending);
      console.log(`[checkPendingTrips] Found ${pendingTrips.length} pending trips`);
      return hasPending;
    } catch (error) {
      console.error('Error checking pending trips:', error);
      return false;
    }
  };

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

  // Generate a unique transaction ID for each trip
  const generateTransactionId = () => {
    return 'trip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  };

  // Modified to show the title/description modal
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
    
    // Show the save modal instead of immediately saving
    setShowSaveModal(true);
  };

  // New function to handle saving the trip with title and description
  // Fix for TypeScript errors in saveTripWithDetails function
  const saveTripWithDetails = async (title: string, description: string) => {
    setUploadInProgress(true);
    
    try {
      // Make sure userId exists before proceeding
      if (!userId) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        setUploadInProgress(false);
        setShowSaveModal(false);
        return;
      }

      const tripData: TripData = {
        userId: userId, // Now we're sure userId is a string, not null
        startedAt: new Date(startTime!).toISOString(),
        endedAt: new Date().toISOString(),
        distanceKm: totalDistance,
        durationSeconds: duration,
        averagePace: pace,
        route: route.map(({ latitude, longitude }) => ({ latitude, longitude })),
        type: selectedActivity,
        title: title,
        info: description
      };
      
      // Check if we're offline
      const networkState = await NetInfo.fetch();
      
      if (!networkState.isConnected) {
        const transactionId = generateTransactionId();
        await saveTripLocally(tripData, photos, transactionId);
        setHasPendingTrips(true);
        Alert.alert(
          'Offline mode', 
          'Tvoj trip bol uložný lokálne. Bude sa synchronizovať, keď sa pripojíš k internetu.'
        );
      } else {
        // Online - proceed normally
        const result = await apiService.createTrip(tripData);
        
        if (result && result.success) {
          setTripId(result.tripId);
          
          // Upload photos one by one
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
          
          Alert.alert('Trip bol uložený', 'Tvoj trip bol úspešne uložený.');
        } else {
          throw new Error('Vytvorenie tripu zlyhalo');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', `Chyba pri ukladaní: ${error.message}. Uloženie do lokálneho zariadenia.`);
        
        // Make sure userId exists before creating tripData
        if (userId) {
          const tripData: TripData = {
            userId: userId, // Now we're sure userId is a string, not null
            startedAt: new Date(startTime!).toISOString(),
            endedAt: new Date().toISOString(),
            distanceKm: totalDistance,
            durationSeconds: duration,
            averagePace: pace,
            route: route.map(({ latitude, longitude }) => ({ latitude, longitude })),
            type: selectedActivity,
            title: title,
            info: description
          };
          const transactionId = generateTransactionId();
          await saveTripLocally(tripData, photos, transactionId);
          setHasPendingTrips(true);
        }
      }
    } finally {
      setUploadInProgress(false);
      setShowSaveModal(false);
    }
  };
  
  const saveTripLocally = async (tripData: TripData, photos: PhotoUpload[], transactionId: string) => {
    try {
      const pendingTripsJson = await AsyncStorage.getItem(PENDING_TRIPS_KEY);
      const pendingTrips: PendingTrip[] = pendingTripsJson ? JSON.parse(pendingTripsJson) : [];
      
      pendingTrips.push({
        tripData,
        photos,
        transactionId, // Store the unique transaction ID
      });
    
      await AsyncStorage.setItem(PENDING_TRIPS_KEY, JSON.stringify(pendingTrips));
      
      console.log('Trip saved locally:', tripData);
    } catch (error) {
      console.error('Error saving trip locally:', error);
      Alert.alert('Error', 'Failed to save trip locally. Please try again.');
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
          quality: 0.5,
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
          
          if (tripId && !isOffline) {
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

  // Cancel the save modal
  const cancelSaveModal = () => {
    setShowSaveModal(false);
  };

  // Manual sync function - still available for the UI, but now auto-sync is the primary method
  const syncNow = async () => {
    console.log('[syncNow] Manual sync triggered');
    
    // Get current network state
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.log('[syncNow] Device is offline, cannot sync');
      Alert.alert('Offline', 'Cannot sync while offline. Please connect to the internet first.');
      return;
    }
    
    if (isSyncing) {
      console.log('[syncNow] Sync already in progress');
      Alert.alert('Sync in Progress', 'A sync operation is already in progress.');
      return;
    }
    
    // Check if we have any pending trips before trying to sync
    const hasPending = await checkPendingTrips();
    if (!hasPending) {
      console.log('[syncNow] No pending trips to sync');
      Alert.alert('No Pending Trips', 'There are no pending trips to synchronize.');
      return;
    }
    
    // All checks passed, proceed with sync
    console.log('[syncNow] Starting sync operation');
    syncPendingTrips();
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
    isOffline,
    hasPendingTrips,
    isSyncing,
    showSaveModal,
    uploadInProgress,
    startRecording,
    stopRecording,
    takePhoto,
    setSelectedActivity,
    syncNow,
    saveTripWithDetails,
    cancelSaveModal
  };
}