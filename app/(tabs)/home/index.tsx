import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { fetchAllTrips } from "@/utils/api";
import TripCard from "@/app/(tabs)/home/components/TripCard";
import { getToken } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useTheme } from "../../ThemeContext"; 
import { lightTheme, darkTheme } from "../../theme"; 
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

type Trip = {
  id: number;
  title: string;
  photo_urls?: string[];
  username: string;
  ended_at: string;
  distance_km: number;
  duration_seconds: number;
  average_pace: string;
  likes_count: number;
  comments_count: number;
  route: {
    type: string;
    coordinates: [number, number][];
  };
};


const TripsScreen = ({ token }: { token: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();
  const [trips, setTrips] = useState<Trip[]>([]);

  const handleDeleteTrip = (tripId: number) => {
    setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
  };
  

  const styles = StyleSheet.create({
    centered: {
      flex: 1,
      textAlign: "center",
      marginTop: 40,
      color: theme.text,
    },
    list: {
      padding: 10,
      backgroundColor: theme.background,
      alignItems: isTablet ? "center" : "stretch",
      width: '100%',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.background,
      maxWidth: isTablet ? 600 : '100%',
      alignSelf: isTablet ? 'center' : undefined,
      width: isTablet ? '80%' : '100%',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoIcon: {
      width: 24,
      height: 24,
      tintColor: '#4CAF50', 
    },
    logoText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginLeft: 8,
      color: theme.text,
    },
    notificationButton: {
      padding: 4,
    },
    notificationIcon: {
      width: 24,
      height: 24,
      tintColor: theme.text,
    },
  });

  useEffect(() => {
    const loadTrips = async () => {
      const token = await getToken();
      if (!token) {
        setError("Nemáte prístup");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) {
          router.replace('/(auth)/login');
          return;
        }

        const response = await fetchAllTrips(token);
        if (response.success) {
          setTrips(response.trips);
        } else {
          setError(response.error || "Nastala chyba");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTrips();
  }, [token]);

  if (loading)
    return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={styles.centered}>{error}</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Tripify</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
        >
          <Image 
            source={require('@/assets/images/bell.png')}
            style={styles.notificationIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
  
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            onPress={() => router.push(`/home/trip/TripDetail?tripId=${item.id}`)}
            onDeleteTrip={handleDeleteTrip}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
  
};

export default TripsScreen;
