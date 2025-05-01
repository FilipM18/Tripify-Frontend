import { View, Text, StyleSheet } from 'react-native';

export default function MemoriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mapa spomienok (Map-memories)</Text>
      {/* Add MapView and trip photos here later */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, color: '#4CAF50' },
});
