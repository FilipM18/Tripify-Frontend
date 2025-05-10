import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { API_URL } from '@/utils/constants';
import { getLikes, hitLike, verifyToken } from '@/utils/api';
import { getToken } from '@/utils/auth';
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { useWebSocket } from '@/utils/WebSocketContext';
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

type TripCardProps = {
  trip: Trip;
  onPress: () => void;
  onDeleteTrip: (tripId: number) => void;
};

const TripCard: React.FC<TripCardProps> = ({ trip, onPress, onDeleteTrip }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(trip.likes_count));
  const [commentCount, setCommentCount] = useState(Number(trip.comments_count));
  const { isTablet, width } = useScreenDimensions();
  const { theme, visionMode } = useTheme();
  const { subscribe } = useWebSocket();
  
  // Calculate card dimensions based on screen size
  const CARD_WIDTH = isTablet 
    ? Math.min(600, width * 0.8)  // 80% of screen width up to 600px max on tablets
    : width * 0.95;               // 95% of screen width on phones
  
  // Other responsive dimensions
  const MAP_HEIGHT = isTablet ? 220 : 180;
  const PHOTO_SIZE = isTablet ? 200 : 140;
  
  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const data = await getLikes(trip.id, "trip");
        if (!data.success) throw new Error(data.error || 'Nastala chyba');
        
        const token = await getToken();
        if (!token) throw new Error('Nemáte prístup');
        const user = await verifyToken(token);
        const userId = user.user.id;
        
        const isLiked = data.likes.includes(userId);
        setIsLiked(isLiked);
      } catch (err) {
        console.error(err);
      }
    };
    
    checkIfLiked();

    const unsubscribe = subscribe('like-update', (data) => {
      if (data.contentType === 'trip' && data.contentId.toString() === trip.id.toString()) {
        if (data.action === 'like') {
          setLikeCount(prev => prev + 1);
        } else {
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      }
    });
    
    const commentUnsubscribe = subscribe('new-comment', (data) => {
      if (data.tripId.toString() === trip.id.toString()) {
        setCommentCount(prev => prev + 1);
      }
    });
    
    return () => {
      unsubscribe();
      commentUnsubscribe();
    };
  }, [trip.id, subscribe]);

  const handleLike = async (tripId: number, type: string) => {
    try {
      const data = await hitLike(tripId, type);
      if (!data.success) throw new Error(data.error || 'Nastala chyba');
      
      setIsLiked(!isLiked);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleDeleteTrip = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Nemáte prístup');
      
      const response = await fetch(`${API_URL}/trips/${trip.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        Alert.alert('Úspech', 'Výlet bol úspešne odstránený');

        if (onDeleteTrip) {
          onDeleteTrip(trip.id);
        }
      } else {
        Alert.alert('Error', data.error || 'Nastala chyba pri odstraňovaní výletu');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Nepodarilo sa odstrániť výlet. Skúste to znova neskôr.');
    }
  };
  
  const showDeleteConfirmation = () => {
    Alert.alert(
      'Vymazať výlet',
      'Ste si istý, že chcete vymazať tento výlet? Táto akcia je nezvratná.',
      [
        { text: 'Zrušiť', style: 'cancel' },
        { text: 'Vymazať', style: 'destructive', onPress: handleDeleteTrip }
      ]
    );
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

  const getActivityColor = (activeColor: string) => {
    return theme.primary;
  };

  const hasPhotos = trip.photo_urls && trip.photo_urls.length > 0;
  const date = new Date(trip.ended_at);
  const formatted = date.toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getTripAccessibilityLabel = () => {
    return `Výlet ${trip.title} od užívateľa ${trip.username}, na vzdialenosť ${formatNum(trip.distance_km)} kilometrov, trvanie ${formatDuration(trip.duration_seconds)}, vytvorený ${formatted}`;
  };

  const styles = useScaledStyles((scale) => ({
    card: {
      backgroundColor: theme.card,
      borderRadius: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
      padding: isTablet ? 20 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      marginBottom: isTablet ? 24 * Math.sqrt(scale) : 20 * Math.sqrt(scale),
      width: CARD_WIDTH,
      alignSelf: 'center',
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOpacity: 0.07,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    avatar: {
      width: isTablet ? 48 * Math.sqrt(scale) : 36 * Math.sqrt(scale),
      height: isTablet ? 48 * Math.sqrt(scale) : 36 * Math.sqrt(scale),
      borderRadius: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
      backgroundColor: theme.background,
    },
    headerText: {
      marginLeft: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      flex: 1,
      minWidth: 0,
    },
    menuButton: {
      padding: isTablet ? 6 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
    },
    title: {
      fontSize: isTablet ? 20 * scale : 18 * scale,
      fontWeight: 'bold',
      marginBottom: isTablet ? 8 * Math.sqrt(scale) : 6 * Math.sqrt(scale),
      marginLeft: isTablet ? 4 * Math.sqrt(scale) : 2 * Math.sqrt(scale),
      color: theme.text,
      flexShrink: 1,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      marginLeft: isTablet ? 4 * Math.sqrt(scale) : 2 * Math.sqrt(scale),
      marginRight: isTablet ? 4 * Math.sqrt(scale) : 2 * Math.sqrt(scale),
      flexWrap: 'wrap',
    },
    infoText: {
      fontSize: isTablet ? 15 * scale : 13 * scale,
      color: theme.secondText,
      flexShrink: 1,
      marginRight: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    mediaScroll: {
      marginBottom: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      height: MAP_HEIGHT,
    },
    mapContainer: {
      height: MAP_HEIGHT,
      borderRadius: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      overflow: 'hidden',
      backgroundColor: '#d0e6fa',
      justifyContent: 'center',
      alignItems: 'center',
    },
    map: {
      width: '100%',
      height: '100%',
      borderRadius: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      backgroundColor: '#d0e6fa',
    },
    mapOnlyRow: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      flexDirection: 'row',
    },
    photo: {
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
      borderRadius: isTablet ? 18 * Math.sqrt(scale) : 14 * Math.sqrt(scale),
      marginRight: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      backgroundColor: theme.border,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      paddingHorizontal: isTablet ? 8 * Math.sqrt(scale) : 6 * Math.sqrt(scale),
    },
    footerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isTablet ? 6 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
    },
    footerText: {
      marginLeft: isTablet ? 6 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
      fontSize: isTablet ? 16 * scale : 15 * scale,
      color: theme.text,
    },
    tabletMediaContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tabletMapContainer: {
      width: hasPhotos ? '60%' : '100%',
      height: MAP_HEIGHT,
    },
    tabletPhotoScroll: {
      width: '38%',
      height: MAP_HEIGHT,
    },
  }));

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.85}
        accessibilityLabel={getTripAccessibilityLabel()}
        accessibilityRole="button"
        accessibilityHint="Zobrazí detaily výletu"
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/avatar_placeholder.png')}
            style={styles.avatar}
            accessibilityLabel={`Profilový obrázok užívateľa ${trip.username}`}
          />
          <View style={styles.headerText}>
            <AccessibleText variant="bodyBold" numberOfLines={1} ellipsizeMode="tail">
              {trip.username}
            </AccessibleText>
            <AccessibleText variant="caption" numberOfLines={1} ellipsizeMode="tail">
              {formatted}
            </AccessibleText>
          </View>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={showDeleteConfirmation}
            accessibilityLabel="Možnosti výletu"
            accessibilityRole="button"
            accessibilityHint="Zobrazí možnosti vymazania výletu"
          >
            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <AccessibleText 
          variant="header2" 
          numberOfLines={1} 
          ellipsizeMode="tail"
          style={styles.title}
        >
          {trip.title}
        </AccessibleText>

        <View style={styles.infoRow}>
          <AccessibleText variant="body" style={styles.infoText}>
            Vzdialenosť: <AccessibleText variant="bodyBold">{formatNum(trip.distance_km)}km</AccessibleText>
          </AccessibleText>
          <AccessibleText variant="body" style={styles.infoText}>
            tempo: <AccessibleText variant="bodyBold">{formatNum(trip.average_pace)}</AccessibleText>
          </AccessibleText>
          <AccessibleText variant="body" style={styles.infoText}>
            čas: <AccessibleText variant="bodyBold">{formatDuration(trip.duration_seconds)}</AccessibleText>
          </AccessibleText>
        </View>
      </TouchableOpacity>

      {isTablet && hasPhotos ? (
        <View style={styles.tabletMediaContainer}>
          {/* Map */}
          <View style={[styles.mapContainer, styles.tabletMapContainer]}>
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
              accessibilityLabel="Mapa trasy výletu"
            >
              <Polyline
                coordinates={geoJsonToLatLngs(trip.route)}
                strokeColor="#d32f2f"
                strokeWidth={4}
              />
            </MapView>
          </View>
          
          {/* Photos */}
          <ScrollView 
            style={styles.tabletPhotoScroll}
            accessibilityLabel={`Fotografie výletu, ${trip.photo_urls?.length} fotografií`}
          >
            {(trip.photo_urls ?? []).map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: `${API_URL}${url}` }}
                style={[styles.photo, { marginBottom: 10, width: '100%' }]}
                accessibilityLabel={`Fotografia výletu ${idx + 1}`}
              />
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.mapOnlyRow}>
          <View style={[styles.mapContainer, { width: hasPhotos ? '75%' : '95%' }]}>
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
              accessibilityLabel="Mapa trasy výletu"
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
        <TouchableOpacity 
          style={styles.footerItem} 
          onPress={() => handleLike(trip.id, "trip")}
          accessibilityLabel={`${isLiked ? 'Už sa vám páči' : 'Páči sa mi to'}, ${likeCount} ľuďom sa to páči`}
          accessibilityRole="button"
          accessibilityState={{ checked: isLiked }}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={isTablet ? 26 : 22} 
            color={isLiked ? theme.primary : theme.text} 
          />
          <AccessibleText variant="body">
            {likeCount}
          </AccessibleText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerItem} 
          onPress={onPress}
          accessibilityLabel={`Komentáre, ${commentCount} komentárov`}
          accessibilityRole="button"
          accessibilityHint="Zobrazí komentáre k výletu"
        >
          <Ionicons name="chatbubble-outline" size={isTablet ? 26 : 22} color={theme.text} />
          <AccessibleText variant="body">
            {commentCount}
          </AccessibleText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerItem}
          accessibilityLabel="Zdieľať výlet"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="share-outline" size={isTablet ? 26 : 22} color={theme.text} />
          <AccessibleText variant="body">
            Share
          </AccessibleText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TripCard;