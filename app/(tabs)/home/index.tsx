import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { fetchAllTrips } from "@/utils/api";
import TripCard from "@/app/(tabs)/home/components/TripCard";
import { getToken } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useTheme } from "@/app/ThemeContext";
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

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
  const { theme } = useTheme();
  const { isTablet } = useScreenDimensions();
  const [trips, setTrips] = useState<Trip[]>([]);

  const handleDeleteTrip = (tripId: number) => {
    setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centeredText: {
      textAlign: "center",
      marginTop: 40 * Math.sqrt(scale),
      color: theme.text,
      fontSize: 16 * scale,
    },
    list: {
      padding: 10 * Math.sqrt(scale),
      backgroundColor: theme.background,
      alignItems: isTablet ? "center" : "stretch",
      width: '100%',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16 * Math.sqrt(scale),
      paddingVertical: 12 * Math.sqrt(scale),
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
      width: 24 * Math.sqrt(scale),
      height: 24 * Math.sqrt(scale),
      tintColor: theme.primary, 
    },
    logoText: {
      fontSize: 24 * scale,
      fontWeight: 'bold',
      marginLeft: 8 * Math.sqrt(scale),
      color: theme.text,
    },
    notificationButton: {
      padding: 4 * Math.sqrt(scale),
    },
    notificationIcon: {
      width: 24 * Math.sqrt(scale),
      height: 24 * Math.sqrt(scale),
      tintColor: theme.text,
    },
  }));

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator 
          size="large" 
          color={theme.primary}
          accessibilityLabel="Načítavanie výletov"
        />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centered}>
        <AccessibleText 
          variant="body" 
          style={styles.centeredText}
          accessibilityLabel={`Chyba: ${error}`}
        >
          {error}
        </AccessibleText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View 
          style={styles.logoContainer}
          accessibilityLabel="Tripify logo"
        >
          <Image 
            source={require('@/assets/images/logo.png')}
            style={styles.logoIcon}
            resizeMode="contain"
            accessibilityLabel="Tripify logo ikona"
          />
          <AccessibleText variant="header1" style={styles.logoText}>
            Tripify
          </AccessibleText>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          accessibilityLabel="Notifikácie"
          accessibilityRole="button"
          accessibilityHint="Zobrazí notifikácie"
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
        accessibilityLabel="Zoznam výletov"
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={
          <AccessibleText 
            variant="body" 
            style={styles.centeredText}
          >
            Žiadne výlety na zobrazenie
          </AccessibleText>
        }
      />
    </View>
  );
};

export default TripsScreen;