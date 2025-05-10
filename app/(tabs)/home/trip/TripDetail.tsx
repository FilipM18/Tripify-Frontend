import React, { useEffect, useState } from "react";
import {
    View,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getToken } from "@/utils/auth";
import { fetchTrip } from "@/utils/api";
import TripDetailCard from "./TripDetailCard";
import { useTheme } from "@/app/ThemeContext";
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

const TripDetailScreen = () => {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();
    const { isTablet } = useScreenDimensions();
    
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

    const styles = useScaledStyles((scale) => ({
        container: { 
            flex: 1, 
            backgroundColor: theme.background,
        },
        centered: { 
            flex: 1, 
            justifyContent: "center", 
            alignItems: "center" 
        },
        loadingText: {
            color: theme.text,
            marginTop: isTablet ? 15 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
            fontSize: isTablet ? 18 * scale : 16 * scale,
        },
        errorText: {
            color: 'red',
            fontSize: isTablet ? 18 * scale : 16 * scale,
            textAlign: 'center',
            padding: isTablet ? 30 * Math.sqrt(scale) : 20 * Math.sqrt(scale),
        },
    }));

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator 
                    size="large" 
                    color={theme.primary}
                    accessibilityLabel="Načítavanie detailu výletu" 
                />
                <AccessibleText 
                    variant="body" 
                    style={styles.loadingText}
                >
                    Načítavanie detailu výletu...
                </AccessibleText>
            </View>
        );
    }
    
    if (error) {
        return (
            <View style={styles.centered}>
                <AccessibleText 
                    variant="body" 
                    style={styles.errorText}
                    accessibilityLabel={`Chyba: ${error}`}
                >
                    {error}
                </AccessibleText>
            </View>
        );
    }
    
    if (!trip) return null;

    return (
        <View 
            style={styles.container}
            accessibilityLabel="Detail výletu"
        >
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }}
                accessibilityLabel={`Detail výletu od užívateľa ${trip.username}`}
            >
                <TripDetailCard trip={trip} />
            </ScrollView>
        </View>
    );
};

export default TripDetailScreen;