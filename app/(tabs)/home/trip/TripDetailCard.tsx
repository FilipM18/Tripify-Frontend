import React, { use, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
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
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { router } from "expo-router";
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';


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
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet, width } = useScreenDimensions();

  const MAP_HEIGHT = isTablet ? 420 : 340;
  const contentWidth = isTablet ? Math.min(700, width * 0.85) : width;

  useEffect(() => {

    //Check if the trip is liked by the user
    const checkIfLiked = async () => {
      const data = await getLikes(trip.id, "trip");
      console.log("data",data);
      if (!data.success) throw new Error(data.error || 'Failed to fetch likes');
      // check if users id is in the list of likes
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const user = await verifyToken(token);
      const userId = user.user.id;
      console.log("userID",userId);
      // how to check if userId is in the data if it look like this:  data {"likes": ["4be333e5-751a-44de-9ebd-f618acee8a04"], "success": true}?
      const isLiked2 = data.likes.includes(userId);
      if (isLiked2) {
        setIsLiked(true);
      }
      else {
        setIsLiked(false);
      }
      console.log("isLiked",isLiked2);
      //setIsLiked(isLiked);
    }
    checkIfLiked();
  }, [trip.id]);

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
      
      // Toggle like state and update count
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
    }
    catch (err: any) {
      console.error(err.message);
    }
  };

  const date = new Date(trip.ended_at);
  const formatted = date.toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleCommentSubmit = async () => {
    if (comment.trim() === "") return; // Prevent empty comments
  
    try {
      const result = await addComment(trip.id, comment);
      if (result.success) {
        // Update comment count
        setCommentCount(prevCount => prevCount + 1);
        
        // Toggle refresh trigger to cause comments to reload
        setRefreshComments(prev => !prev);
        
        // Reset input field
        setComment("");
        
        Alert.alert('Úspech', 'Komentár bol pridaný');
      } else {
        Alert.alert('Chyba', result.error || 'Pridanie komentára zlyhalo');
      }
    } catch (error) {
      Alert.alert('Chyba', 'Nepodarilo sa pridať komentár');
    }
  };

  const styles = StyleSheet.create({
    mapWrapper: {
      width: width,
      height: MAP_HEIGHT,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: "hidden",
      backgroundColor: "#d0e6fa",
    },
    map: {
      width: "100%",
      height: "100%",
    },
    cardOverlay: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -32, // overlays the map
      paddingTop: 16,
      paddingBottom: 24,
      paddingHorizontal: 18,
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 5 },
      minHeight: 340,
      maxWidth: isTablet ? contentWidth : '100%',
      alignSelf: isTablet ? 'center' : undefined,
      width: isTablet ? contentWidth : '100%',
    },
    grabber: {
      alignSelf: "center",
      width: 48,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.secondBackground,
      marginBottom: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#fff",
      marginRight: 10,
    },
    headerText: {
      flex: 1,
      minWidth: 0,
    },
    username: {
      fontWeight: "bold",
      fontSize: 16,
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
    mainText: {
      fontSize: 15,
      color: theme.text,
      marginBottom: 10,
      marginLeft: 2,
      marginRight: 2,
    },
    mediaScroll: {
      marginBottom: 10,
      minHeight: 160,
      maxHeight: 160,
    },
    photo: {
      width: 140,
      height: 140,
      borderRadius: 14,
      marginRight: 12,
      backgroundColor: theme.border,
    },
    statsBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: theme.statBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      marginTop: 2,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statLabel: {
      fontSize: 13,
      color: theme.thirdText,
      marginBottom: 2,
    },
    statValue: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.text,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
      paddingHorizontal: 6,
    },
    footerItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    footerText: {
      marginLeft: 4,
      fontSize: 15,
      color: theme.text,
    },
    commentsSection: {
      marginTop: 18,
      padding: 10,
      backgroundColor: theme.statBackground,
      borderRadius: 12,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    commentsTitle: {
      fontWeight: "bold",
      fontSize: 16,
      color: theme.text,
      marginBottom: 6,
    },
    commentsInput: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      padding: 8,
      backgroundColor: theme.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    input: {
      flex: 1,
      padding: 8,
      fontSize: 14,
      color: theme.text,
    },
    sendButton: {
      padding: 8,
      backgroundColor: theme.primary,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View>
      <TouchableOpacity onPress={() => {router.back()}} style={{ marginRight: 10 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
      </TouchableOpacity>
      {/* Map at the top */}
      <View style={styles.mapWrapper}>
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
            strokeColor="#1976d2"
            strokeWidth={4}
          />
        </MapView>
      </View>

      {/* Card overlays the map */}
      <View style={styles.cardOverlay}>
        <View style={styles.grabber} />

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/avatar_placeholder.png")}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.username}>{trip.username}</Text>
            <Text style={styles.date}>{formatted}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Main Post Text */}
        <Text style={styles.mainText}>
          {trip.description || "Popis výletu..."}
        </Text>

        {/* Photos */}
        {hasPhotos && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mediaScroll}
          >
            {(trip.photo_urls ?? []).map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: `${API_URL}${url}` }}
                style={styles.photo}
              />
            ))}
          </ScrollView>
        )}

        {/* Stats */}
        <View style={styles.statsBox}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Štart</Text>
            <Text style={styles.statValue}>
              {trip.started_at?.slice(11, 16) ?? "--:--"}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Koniec</Text>
            <Text style={styles.statValue}>
              {trip.ended_at?.slice(11, 16) ?? "--:--"}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Vzdialenosť</Text>
            <Text style={styles.statValue}>
              {formatNum(trip.distance_km)} km
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Trvanie</Text>
            <Text style={styles.statValue}>
              {formatDuration(trip.duration_seconds)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <TouchableOpacity 
              style={styles.footerItem} 
              onPress={() => {
                handleLike(trip.id, "trip");
                setIsLiked(!isLiked); // Toggle liked state
              }}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={22} 
                color={isLiked ? theme.primary : theme.text} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerItem} onPress={() => {getLike(trip.id, "trip")}}>
              <Text style={styles.footerText}>{likeCount}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerItem}>
            <TouchableOpacity style={styles.footerItem}>
              <Ionicons name="chatbubble-outline" size={22} color={theme.text} />
              <Text style={styles.footerText}>{commentCount}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.footerItem}>
            <MaterialCommunityIcons
              name="share-outline"
              size={22}
              color={theme.text}
            />
            <Text style={styles.footerText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Komentáre</Text>
          <CommentsSection tripId={trip.id.toString()} refreshTrigger={refreshComments} />


          <View style={styles.commentsInput}>
            <TextInput
              placeholder="Pridať komentár..."
              placeholderTextColor={theme.thirdText}
              onChangeText={setComment}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleCommentSubmit}>
              <Text>
                Odoslať
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TripDetailCard;
