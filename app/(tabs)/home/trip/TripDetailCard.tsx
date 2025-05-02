import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { API_URL } from "@/utils/constants";
import CommentsSection from "./CommentsList";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MAP_HEIGHT = 340; // Taller for visual impact

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

  const date = new Date(trip.ended_at);
  const formatted = date.toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View>
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
            <Ionicons name="ellipsis-vertical" size={20} color="#333" />
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
            <Ionicons name="heart-outline" size={22} color="#333" />
            <Text style={styles.footerText}>{trip.likes_count}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="chatbubble-outline" size={22} color="#333" />
            <Text style={styles.footerText}>{trip.comments_count}</Text>
          </View>
          <TouchableOpacity style={styles.footerItem}>
            <MaterialCommunityIcons
              name="share-outline"
              size={22}
              color="#333"
            />
            <Text style={styles.footerText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Komentáre</Text>
          <CommentsSection tripId={trip.id.toString()} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrapper: {
    width: SCREEN_WIDTH,
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -32, // overlays the map
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    minHeight: 340,
  },
  grabber: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#e0e0e0",
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
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    flexShrink: 1,
  },
  date: {
    fontSize: 12,
    color: "#888",
    flexShrink: 1,
  },
  menuButton: {
    padding: 4,
  },
  mainText: {
    fontSize: 15,
    color: "#333",
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
    backgroundColor: "#eee",
  },
  statsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f4f6fb",
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
    color: "#888",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
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
    color: "#333",
  },
  commentsSection: {
    marginTop: 18,
    padding: 10,
    backgroundColor: "#f8f8fa",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  commentsTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    marginBottom: 6,
  },
});

export default TripDetailCard;
