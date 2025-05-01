import { View, Text, StyleSheet } from 'react-native';

export default function ScreenName() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Toto je názov obrazovky</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, color: '#4CAF50' },
});
