import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { fetchAllTrips } from '@/utils/api';
import TripCard from '@/app/(tabs)/home/components/TripCard';
import { getToken } from '@/utils/auth';
import { useRouter } from 'expo-router';


const TripsScreen = ({ token }: { token: string }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const loadTrips = async () => {
      const token = await getToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      try {
        const response = await fetchAllTrips(token);
        if (response.success) {
          setTrips(response.trips);
        } else {
          setError(response.error || 'Failed to load trips');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTrips();
  }, [token]);

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={styles.centered}>{error}</Text>;

  return (
    <FlatList
      data={trips}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TripCard
          trip={item}
          onPress={() => router.push(`/home/trip/TripDetail?tripId=${item.id}`)} 
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    textAlign: 'center',
    marginTop: 40,
  },
  list: {
    padding: 10,
  },
});

export default TripsScreen;
