import { View, Text, StyleSheet, Button } from 'react-native';

export default function RecordTripScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Záznam nového výletu</Text>
      <Button title="Začať záznam" onPress={() => { /* Start recording logic */ }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, marginBottom: 20, color: '#4CAF50' },
});
