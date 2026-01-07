import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, {user?.username}!</Text>
      <Text style={styles.subtext}>Mobile Network Tools (Prototype)</Text>
      
      <View style={styles.tools}>
         <Button title="Scan Network (Simulated)" onPress={() => alert('Scanning functionality coming soon via native modules')} />
      </View>
      
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={logout} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 20, fontWeight: 'bold' },
  subtext: { fontSize: 16, color: 'gray', marginBottom: 20 },
  tools: { width: '100%', gap: 10 }
});
