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
import { Ionicons } from "@expo/vector-icons";

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
  const { isTablet, width } = useScreenDimensions();
  const [trips, setTrips] = useState<Trip[]>([]);

  // Calculate the ideal content width for tablets
  const CONTENT_WIDTH = isTablet 
    ? Math.min(600, width * 0.85)  // 85% of screen width up to 600px max
    : width;                       // Full width on phones

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
      alignItems: 'center', // Center the content in the FlatList
      width: '100%',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      paddingVertical: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      backgroundColor: theme.background,
      width: CONTENT_WIDTH,        // Use the calculated content width
      maxWidth: '100%',            // Ensure it doesn't overflow
      alignSelf: 'center',         // Center the header
      marginTop: isTablet ? 12 * Math.sqrt(scale) : 0,
      marginBottom: isTablet ? 8 * Math.sqrt(scale) : 0,
      borderRadius: isTablet ? 16 * Math.sqrt(scale) : 0,
      ...isTablet && {
        shadowColor: theme.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      },
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoIcon: {
      width: isTablet ? 32 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
      height: isTablet ? 32 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
      tintColor: theme.primary, 
    },
    logoText: {
      fontSize: isTablet ? 28 * scale : 24 * scale,
      fontWeight: 'bold',
      marginLeft: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      color: theme.text,
    },
    notificationButton: {
      padding: isTablet ? 8 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
      backgroundColor: isTablet ? theme.secondBackground : 'transparent',
      borderRadius: isTablet ? 20 * Math.sqrt(scale) : 0,
      ...isTablet && {
        width: 40 * Math.sqrt(scale),
        height: 40 * Math.sqrt(scale),
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
    notificationIcon: {
      width: isTablet ? 28 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
      height: isTablet ? 28 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
      tintColor: theme.text,
    },
    emptyListContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100 * Math.sqrt(scale),
      width: '100%',
    },
    emptyListText: {
      fontSize: isTablet ? 18 * scale : 16 * scale,
      color: theme.secondText,
      textAlign: 'center',
      marginTop: 20 * Math.sqrt(scale),
    },
    emptyListIcon: {
      marginBottom: 16 * Math.sqrt(scale),
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

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      <Ionicons 
        name="map-outline" 
        size={isTablet ? 80 : 60} 
        color={theme.secondText} 
        style={styles.emptyListIcon}
      />
      <AccessibleText 
        variant="body" 
        style={styles.emptyListText}
        accessibilityLabel="Žiadne výlety na zobrazenie"
      >
        Žiadne výlety na zobrazenie
      </AccessibleText>
    </View>
  );

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
        contentContainerStyle={[
          styles.list,
          trips.length === 0 && { flex: 1 }
        ]}
        accessibilityLabel="Zoznam výletov"
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
};

export default TripsScreen;