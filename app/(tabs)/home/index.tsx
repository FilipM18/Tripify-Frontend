import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Stack } from "expo-router";

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export default function RecordTripScreen() {

  const [route, setRoute] = useState<LocationCoordinates[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [pace, setPace] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerInterval = useRef<number | null>(null);
  const router = useRouter();
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

  // Initial location setup
  useEffect(() => {
    const getInitialLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      setLoading(false);
    };

    getInitialLocation();

    return () => {
      cleanupSubscriptions();
    };
  }, []);

  // Handle recording state changes
  useEffect(() => {
    if (isRecording) {
      startLocationTracking();
      startTimer();
    } else {
      cleanupSubscriptions();
    }

    return () => {
      cleanupSubscriptions();
    };
  }, [isRecording]);

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
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 0.5,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const timestamp = location.timestamp;

        setCurrentLocation(location.coords);

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
  };

  const startTimer = () => {
    timerInterval.current = setInterval(() => {
      if (startTime) {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
  };

  const resetState = () => {
    setRoute([]);
    setTotalDistance(0);
    setPace(0);
    setDuration(0);
  };

  const startRecording = () => {
    resetState();
    setStartTime(Date.now());
    setIsRecording(true);
  };

  const stopRecording = async () => {
    setIsRecording(false);

    const tripData = {
        userId: "d574bfdb-1c5d-4c97-ac74-a27ca33a9f02", // Replace with actual user ID
        startedAt: new Date(startTime!).toISOString(),
        endedAt: new Date().toISOString(),
        distanceKm: totalDistance,
        durationSeconds: duration,
        averagePace: pace,
        route: route.map(({ latitude, longitude }) => ({ latitude, longitude })),
        type: 'running', // or 'cycling', etc.
    };
    let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRiZTMzM2U1LTc1MWEtNDRkZS05ZWJkLWY2MThhY2VlOGEwNCIsImVtYWlsIjoidm9qYWtAZ21haWwuY29tIiwidXNlcm5hbWUiOiJqYW5rb192b2phayIsImlhdCI6MTc0NTQ4NTUxOCwiZXhwIjoxNzQ1NTcxOTE4fQ.69quRNe-6flyYBvQI6ntN2xRLtueuyTnIOel9Z7l8SY';
    try {
        const response = await fetch('http://192.168.1.32:3000/trips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                      'Authorization' : `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRiZTMzM2U1LTc1MWEtNDRkZS05ZWJkLWY2MThhY2VlOGEwNCIsImVtYWlsIjoidm9qYWtAZ21haWwuY29tIiwidXNlcm5hbWUiOiJqYW5rb192b2phayIsImlhdCI6MTc0NTgyOTE1MiwiZXhwIjoxNzQ1OTE1NTUyfQ.faTzUDEe_5GN4P2crKuLgLtPqpy_nq43_FzMJBDxjqM'}`
             },
            body: JSON.stringify(tripData),
        });

        const result = await response.json();
        if (result.success) {
            console.log('Trip saved:', result.tripId);
        }
    } catch (error) {
        console.error('Failed to save trip:', error);
    }
};


  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading location...</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>GPS {isRecording ? 'Recording' : 'Ready'}</Text>
      </View>
      
      {currentLocation ? (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          userLocationCalloutEnabled={false}
        >
          {route.length > 0 && (
            <Polyline coordinates={route} strokeWidth={4} strokeColor="#4CAF50" />
          )}
        </MapView>
      ) : (
        <Text style={styles.errorText}>Could not get location</Text>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          <Text style={styles.statLabel}>Time</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalDistance.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Distance (km)</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{pace.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Pace (km/h)</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, isRecording ? styles.stopButton : styles.startButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>{isRecording ? 'Finish' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  map: { 
    flex: 1 
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  buttonContainer: {
    padding: 20,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
  },
});
