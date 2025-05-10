import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { API_URL } from "@/utils/constants";
import CommentsSection from "./CommentsList";
import { getToken } from "@/utils/auth";
import { addComment, getLikes, hitLike, verifyToken } from "@/utils/api";
import { router } from "expo-router";
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { useWebSocket } from "@/utils/WebSocketContext";
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

function geoJsonToLatLngs(route: { coordinates: [any, any][] }) {
  return route.coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}

interface Trip {
  id: number;
  username: string;
  description?: string;
  photo_urls?: string[];
  route: { coordinates: [number, number][] };
  ended_at: string;
  started_at?: string;
  distance_km: number;
  duration_seconds: number;
  likes_count: number;
  comments_count: number;
}

const TripDetailCard = ({ trip }: { trip: Trip }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(trip.likes_count));
  const [comment, setComment] = useState("");
  const [commentCount, setCommentCount] = useState(Number(trip.comments_count));
  const [refreshComments, setRefreshComments] = useState(false);
  const { theme, visionMode, fontScale } = useTheme();
  const { isTablet, width } = useScreenDimensions();
  const { subscribe } = useWebSocket();
  
  const MAP_HEIGHT = isTablet ? 420 : 340;
  const contentWidth = isTablet ? Math.min(700, width * 0.85) : width;

  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const data = await getLikes(trip.id, "trip");
        if (!data.success) throw new Error(data.error || 'Failed to fetch likes');

        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const user = await verifyToken(token);

        const userId = user.user.id;
        
        const isLiked2 = data.likes.includes(userId);
        setIsLiked(isLiked2);
      } catch (error) {
        console.error('Error checking if trip is liked:', error);
      }
    };
    
    checkIfLiked();

    const unsubscribe = subscribe('like-update', async (data) => {
      if (data.contentType === 'trip' && data.contentId.toString() === trip.id.toString()) {
        if (data.action === 'like') {
          setLikeCount(prev => prev + 1);
        } else {
          setLikeCount(prev => Math.max(0, prev - 1));
        }
        
        const token = await getToken();
        if (token) {
          const user = await verifyToken(token);
          if (user.user.id !== data.userId) {
            const likesData = await getLikes(trip.id, "trip");
            const isCurrentlyLiked = likesData.likes.includes(user.user.id);
            setIsLiked(isCurrentlyLiked);
          }
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

  const hasPhotos = trip.photo_urls && trip.photo_urls.length > 0;
  
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}min`;
  };

  const formatNum = (num: string | number) => {
    const n = typeof num === "string" ? parseFloat(num) : num;
    return !isNaN(n) ? n.toFixed(2) : num;
  };

  const handleLike = async (tripId: number, type: string) => {
    try {
      const data = await hitLike(tripId, type);
      if (!data.success) throw new Error(data.error || 'Failed to like trip');

      setIsLiked(!isLiked);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleCommentSubmit = async () => {
    if (comment.trim() === "") return;
  
    try {
      const result = await addComment(trip.id, comment);
      if (result.success) {
        setRefreshComments(prev => !prev);
        setComment("");
        
        Alert.alert('Úspech', 'Komentár bol pridaný');
      } else {
        Alert.alert('Chyba', result.error || 'Pridanie komentára zlyhalo');
      }
    } catch (error) {
      Alert.alert('Chyba', 'Nepodarilo sa pridať komentár');
    }
  };

  const date = new Date(trip.ended_at);
  const formatted = date.toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getTripAccessibilityLabel = () => {
    const desc = trip.description ? `, popis: ${trip.description}` : '';
    return `Výlet od užívateľa ${trip.username}, vzdialenosť ${formatNum(trip.distance_km)} kilometrov, 
    trvanie ${formatDuration(trip.duration_seconds)}, vytvorený ${formatted}${desc}`;
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    backButton: {
      padding: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      marginLeft: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    backIcon: {
      fontSize: isTablet ? 28 * scale : 24 * scale,
      color: theme.text,
    },
    mapWrapper: {
      width: width,
      height: MAP_HEIGHT,
      borderTopLeftRadius: isTablet ? 32 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
      borderTopRightRadius: isTablet ? 32 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
      overflow: "hidden",
      backgroundColor: "#d0e6fa",
    },
    map: {
      width: "100%",
      height: "100%",
    },
    cardOverlay: {
      backgroundColor: theme.background,
      borderTopLeftRadius: isTablet ? 36 * Math.sqrt(scale) : 28 * Math.sqrt(scale),
      borderTopRightRadius: isTablet ? 36 * Math.sqrt(scale) : 28 * Math.sqrt(scale),
      marginTop: isTablet ? -40 * Math.sqrt(scale) : -32 * Math.sqrt(scale),
      paddingTop: isTablet ? 24 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      paddingBottom: isTablet ? 32 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
      paddingHorizontal: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 5 },
      minHeight: isTablet ? 400 : 340,
      maxWidth: isTablet ? contentWidth : '100%',
      alignSelf: isTablet ? 'center' : undefined,
      width: isTablet ? contentWidth : '100%',
    },
    grabber: {
      alignSelf: "center",
      width: isTablet ? 60 * Math.sqrt(scale) : 48 * Math.sqrt(scale),
      height: isTablet ? 6 * Math.sqrt(scale) : 5 * Math.sqrt(scale),
      borderRadius: isTablet ? 4 * Math.sqrt(scale) : 3 * Math.sqrt(scale),
      backgroundColor: theme.secondBackground,
      marginBottom: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    avatar: {
      width: isTablet ? 56 * Math.sqrt(scale) : 44 * Math.sqrt(scale),
      height: isTablet ? 56 * Math.sqrt(scale) : 44 * Math.sqrt(scale),
      borderRadius: isTablet ? 28 * Math.sqrt(scale) : 22 * Math.sqrt(scale),
      backgroundColor: theme.background,
      marginRight: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
    },
    headerText: {
      flex: 1,
      minWidth: 0,
    },
    menuButton: {
      padding: isTablet ? 6 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
    },
    mediaScroll: {
      marginBottom: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      minHeight: isTablet ? 200 : 160,
      maxHeight: isTablet ? 200 : 160,
    },
    photo: {
      width: isTablet ? 180 * Math.sqrt(scale) : 140 * Math.sqrt(scale),
      height: isTablet ? 180 * Math.sqrt(scale) : 140 * Math.sqrt(scale),
      borderRadius: isTablet ? 18 * Math.sqrt(scale) : 14 * Math.sqrt(scale),
      marginRight: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      backgroundColor: theme.border,
    },
    statsBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: theme.statBackground,
      borderRadius: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      padding: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      marginBottom: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      marginTop: isTablet ? 4 * Math.sqrt(scale) : 2 * Math.sqrt(scale),
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      paddingHorizontal: isTablet ? 8 * Math.sqrt(scale) : 6 * Math.sqrt(scale),
    },
    footerItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 6 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
    },
    commentsSection: {
      marginTop: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
      padding: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      backgroundColor: theme.statBackground,
      borderRadius: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    commentsInput: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      padding: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      backgroundColor: theme.card,
      borderRadius: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      borderWidth: 1,
      borderColor: theme.border,
    },
    input: {
      flex: 1,
      padding: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      fontSize: isTablet ? 16 * scale : 14 * scale,
      color: theme.text,
    },
    sendButton: {
      padding: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      backgroundColor: theme.primary,
      borderRadius: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      alignItems: "center",
      justifyContent: "center",
    },
    sendButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    descriptionText: {
      marginVertical: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    commentsTitleText: {
      marginBottom: isTablet ? 10 * Math.sqrt(scale) : 6 * Math.sqrt(scale),
    }
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => {router.back()}} 
        style={styles.backButton}
        accessibilityLabel="Späť"
        accessibilityRole="button"
        accessibilityHint="Návrat na predchádzajúcu obrazovku"
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <View 
        style={styles.mapWrapper}
        accessibilityLabel="Mapa výletu"
      >
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: geoJsonToLatLngs(trip.route)[0]?.latitude || 0,
            longitude: geoJsonToLatLngs(trip.route)[0]?.longitude || 0,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
        >
          <Polyline
            coordinates={geoJsonToLatLngs(trip.route)}
            strokeColor="#d32f2f"
            strokeWidth={4}
          />
        </MapView>
      </View>

      <View style={styles.cardOverlay}>
        <View style={styles.grabber} />

        <View 
          style={styles.header}
          accessibilityLabel={`Výlet od užívateľa ${trip.username}, ${formatted}`}
        >
          <Image
            source={require("@/assets/avatar_placeholder.png")}
            style={styles.avatar}
            accessibilityLabel={`Profilový obrázok užívateľa ${trip.username}`}
          />
          <View style={styles.headerText}>
            <AccessibleText variant="bodyBold">
              {trip.username}
            </AccessibleText>
            <AccessibleText variant="caption">
              {formatted}
            </AccessibleText>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            accessibilityLabel="Možnosti výletu"
            accessibilityRole="button"
          >
            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <AccessibleText variant="body" style={styles.descriptionText}>
          {trip.description || "Popis výletu..."}
        </AccessibleText>

        {hasPhotos && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mediaScroll}
            accessibilityLabel={`Fotografie výletu, ${trip.photo_urls?.length || 0} fotografií`}
          >
            {(trip.photo_urls ?? []).map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: `${API_URL}${url}` }}
                style={styles.photo}
                accessibilityLabel={`Fotografia výletu ${idx + 1}`}
              />
            ))}
          </ScrollView>
        )}

        <View 
          style={styles.statsBox}
          accessibilityLabel={`Štatistiky výletu: Štart ${trip.started_at?.slice(11, 16) ?? "--:--"}, Koniec ${trip.ended_at?.slice(11, 16) ?? "--:--"}, Vzdialenosť ${formatNum(trip.distance_km)} kilometrov, Trvanie ${formatDuration(trip.duration_seconds)}`}
        >
          <View style={styles.statItem}>
            <AccessibleText variant="caption">Štart</AccessibleText>
            <AccessibleText variant="bodyBold">
              {trip.started_at?.slice(11, 16) ?? "--:--"}
            </AccessibleText>
          </View>
          <View style={styles.statItem}>
            <AccessibleText variant="caption">Koniec</AccessibleText>
            <AccessibleText variant="bodyBold">
              {trip.ended_at?.slice(11, 16) ?? "--:--"}
            </AccessibleText>
          </View>
          <View style={styles.statItem}>
            <AccessibleText variant="caption">Vzdialenosť</AccessibleText>
            <AccessibleText variant="bodyBold">
              {formatNum(trip.distance_km)} km
            </AccessibleText>
          </View>
          <View style={styles.statItem}>
            <AccessibleText variant="caption">Trvanie</AccessibleText>
            <AccessibleText variant="bodyBold">
              {formatDuration(trip.duration_seconds)}
            </AccessibleText>
          </View>
        </View>

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
              size={22} 
              color={isLiked ? theme.primary : theme.text} 
            />
            <AccessibleText variant="body">
              {likeCount}
            </AccessibleText>
          </TouchableOpacity>

          <View style={styles.footerItem}>
            <Ionicons name="chatbubble-outline" size={22} color={theme.text} />
            <AccessibleText variant="body">
              {commentCount}
            </AccessibleText>
          </View>

          <TouchableOpacity 
            style={styles.footerItem}
            accessibilityLabel="Zdieľať výlet"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="share-outline"
              size={22}
              color={theme.text}
            />
            <AccessibleText variant="body">
              Share
            </AccessibleText>
          </TouchableOpacity>
        </View>

        <View 
          style={styles.commentsSection}
          accessibilityLabel={`Sekcia komentárov, ${commentCount} komentárov`}
        >
          <AccessibleText variant="bodyBold" style={styles.commentsTitleText}>
            Komentáre
          </AccessibleText>
          
          <CommentsSection tripId={trip.id.toString()} refreshTrigger={refreshComments} />

          <View style={styles.commentsInput}>
            <TextInput
              placeholder="Pridať komentár..."
              placeholderTextColor={theme.thirdText}
              onChangeText={setComment}
              value={comment}
              style={styles.input}
              accessibilityLabel="Pole pre zadanie komentára"
              accessibilityHint="Napíšte svoj komentár a odošlite tlačidlom odoslať"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleCommentSubmit}
              accessibilityLabel="Odoslať komentár"
              accessibilityRole="button"
              disabled={comment.trim() === ""}
            >
              <AccessibleText 
                variant="bodyBold" 
                style={styles.sendButtonText}
              >
                Odoslať
              </AccessibleText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TripDetailCard;