import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { API_URL } from '@/utils/constants';
import { getLikes, hitLike, verifyToken } from '@/utils/api';
import { getToken } from '@/utils/auth';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
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

type TripCardProps = {
  trip: Trip;
  onPress: () => void;
};

const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(trip.likes_count));
  const { isTablet, width } = useScreenDimensions();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  
  const CARD_WIDTH = isTablet ? Math.min(600, width * 0.8) : width - 32;
  const MAP_HEIGHT = isTablet ? 220 : 180;
  const PHOTO_SIZE = CARD_WIDTH * 0.65;

  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const data = await getLikes(trip.id, "trip");
        if (!data.success) throw new Error(data.error || 'Failed to fetch likes');
        
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const user = await verifyToken(token);
        const userId = user.user.id;
        
        const isLiked = data.likes.includes(userId);
        setIsLiked(isLiked);
      } catch (err) {
        console.error(err);
      }
    };
    
    checkIfLiked();
  }, [trip.id]);

  const handleLike = async (tripId: number, type: string) => {
    try {
      const data = await hitLike(tripId, type);
      if (!data.success) throw new Error(data.error || 'Failed to like trip');
      
      // Toggle like state and update count numerically
      setIsLiked(!isLiked);
      setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const getLike = async (tripId: number, type: string) => {
    try {
      const data = await getLikes(tripId, type);
      if (!data.success) throw new Error(data.error || 'Failed to fetch likes');
      
      console.log("Likes:", data.likes);
    } catch (err: any) {
      console.error(err.message);
    }
  };
  

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}min`;
  };

  const formatNum = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return !isNaN(n) ? n.toFixed(2) : num;
  };

  function geoJsonToLatLngs(route: { coordinates: [number, number][] }) {
    return route.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
  }

  const hasPhotos = trip.photo_urls && trip.photo_urls.length > 0;
  const mapWidth = hasPhotos ? CARD_WIDTH * 0.75 : CARD_WIDTH*0.95;

  const date = new Date(trip.ended_at);
  const formatted = date.toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 12,
      marginBottom: 20,
      width: CARD_WIDTH,
      alignSelf: 'center', // Center the card on tablet
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOpacity: 0.07,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#fff',
    },
    headerText: {
      marginLeft: 8,
      flex: 1,
      minWidth: 0,
    },
    username: {
      fontWeight: 'bold',
      fontSize: 15,
      color: theme.text,
      flexShrink: 1,
    },
    date: {
      fontSize: 12,
      color: theme.thirdText,
      flexShrink: 1,
    },
    menuButton: {
      padding: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 6,
      marginLeft: 2,
      color: theme.text,
      flexShrink: 1,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      marginLeft: 2,
      marginRight: 2,
      flexWrap: 'wrap',
    },
    infoText: {
      fontSize: 13,
      color: theme.secondText,
      flexShrink: 1,
      marginRight: 8,
    },
    bold: {
      fontWeight: 'bold',
      color: theme.text,
    },
    mediaScroll: {
      marginBottom: 10,
      minHeight: MAP_HEIGHT,
      maxHeight: MAP_HEIGHT,
    },
    mediaScrollContent: {
      alignItems: 'center',
    },
    mapContainer: {
      height: MAP_HEIGHT,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#d0e6fa',
      justifyContent: 'center',
      alignItems: 'center',
    },
    map: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      backgroundColor: '#d0e6fa',
    },
    mapOnlyRow: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      flexDirection: 'row',
    },
    photo: {
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
      borderRadius: 14,
      marginRight: 12,
      backgroundColor: '#eee',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingHorizontal: 6,
    },
    footerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    footerText: {
      marginLeft: 4,
      fontSize: 15,
      color: theme.text,
    },
  });
  
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/avatar_placeholder.png')}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">{trip.username}</Text>
            <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{formatted}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{trip.title}</Text>

        {/* Trip Info Row */}
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Vzdialenosť: <Text style={styles.bold}>{formatNum(trip.distance_km)}km</Text>
          </Text>
          <Text style={styles.infoText}>
            tempo: <Text style={styles.bold}>{formatNum(trip.average_pace)}</Text>
          </Text>
          <Text style={styles.infoText}>
            čas: <Text style={styles.bold}>{formatDuration(trip.duration_seconds)}</Text>
          </Text>
        </View>
      </TouchableOpacity>
      {/* Map & Photo Gallery */}
      {hasPhotos ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mediaScroll}
          contentContainerStyle={styles.mediaScrollContent}
        >
          {/* Map */}
          <View style={[styles.mapContainer, { width: mapWidth }]}>
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: geoJsonToLatLngs(trip.route)[0]?.latitude || 0,
                longitude: geoJsonToLatLngs(trip.route)[0]?.longitude || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              pointerEvents="none"
            >
              <Polyline
                coordinates={geoJsonToLatLngs(trip.route)}
                strokeColor="#d32f2f"
                strokeWidth={4}
              />
            </MapView>
          </View>
          {/* Photos */}
          {(trip.photo_urls ?? []).map((url, idx) => (
            <Image
              key={idx}
              source={{ uri: `${API_URL}${url}` }}
              style={styles.photo}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.mapOnlyRow}>
          <View style={[styles.mapContainer, { width: mapWidth }]}>
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: geoJsonToLatLngs(trip.route)[0]?.latitude || 0,
                longitude: geoJsonToLatLngs(trip.route)[0]?.longitude || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              pointerEvents="none"
            >
              <Polyline
                coordinates={geoJsonToLatLngs(trip.route)}
                strokeColor="#d32f2f"
                strokeWidth={4}
              />
            </MapView>
          </View>
        </View>
      )}

      {/* Footer: Likes, Comments, Share */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleLike(trip.id, "trip")}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={22} 
            color={isLiked ? theme.primary : theme.text} 
          />
          <TouchableOpacity 
            style={styles.footerItem} 
            onPress={() => getLike(trip.id, "trip")}
          >
            <Text style={styles.footerText}>{likeCount}</Text>
          </TouchableOpacity>

        </TouchableOpacity>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={22} color={theme.text} />
          <Text style={styles.footerText}>{trip.comments_count}</Text>
        </View>
        <TouchableOpacity style={styles.footerItem}>
          <MaterialCommunityIcons name="share-outline" size={22} color={theme.text} />
          <Text style={styles.footerText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TripCard;