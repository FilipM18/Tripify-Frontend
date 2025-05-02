import React, { useEffect, useState } from "react";
import {
    View,
    ActivityIndicator,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getToken } from "@/utils/auth";
import { fetchTrip } from "@/utils/api";
import TripDetailCard from "./TripDetailCard";

const TripDetailScreen = () => {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        const token = await getToken();
        try {
            if (!token) throw new Error("token is required");
            const data = await fetchTrip(tripId, token);
            if (data.success) setTrip(data.trip);
            else setError(data.error || "Failed to load trip");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        };
        if (tripId) fetchData();
    }, [tripId]);

    if (loading) return <ActivityIndicator style={styles.centered} />;
    if (error) return <Text style={styles.centered}>{error}</Text>;
    if (!trip) return null;

    return (
        <View style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <TripDetailCard trip={trip} />
        </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default TripDetailScreen;
