import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.166.209.25:5000';

export default function DoerProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profile, setProfile] = useState({
    primarySkill: '',
    yearsOfExperience: '',
    serviceRadius: '',
    biography: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/doers/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        // If profile exists, prefill data
        setProfile({
          primarySkill: data.data.primarySkill || '',
          yearsOfExperience: data.data.yearsOfExperience ? String(data.data.yearsOfExperience) : '',
          serviceRadius: data.data.serviceRadius ? String(data.data.serviceRadius) : '',
          biography: data.data.biography || '',
        });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const payload = {
        primarySkill: profile.primarySkill,
        yearsOfExperience: parseInt(profile.yearsOfExperience, 10),
        serviceRadius: parseInt(profile.serviceRadius, 10),
        biography: profile.biography,
      };

      const response = await fetch(`${API_URL}/api/doers/profile`, {
        method: 'POST', // The backend route accepts POST/PUT
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.push('/(doer)/dashboard') }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/(auth)/login');
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Profile</Text>
      
      <Text style={styles.label}>Primary Skill</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Plumber, Electrician"
        value={profile.primarySkill}
        onChangeText={(text) => setProfile({ ...profile, primarySkill: text })}
      />

      <Text style={styles.label}>Years of Experience</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 5"
        keyboardType="numeric"
        value={profile.yearsOfExperience}
        onChangeText={(text) => setProfile({ ...profile, yearsOfExperience: text })}
      />

      <Text style={styles.label}>Service Radius (km)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 20"
        keyboardType="numeric"
        value={profile.serviceRadius}
        onChangeText={(text) => setProfile({ ...profile, serviceRadius: text })}
      />

      <Text style={styles.label}>Professional Biography</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Tell customers about your expertise..."
        multiline
        numberOfLines={4}
        value={profile.biography}
        onChangeText={(text) => setProfile({ ...profile, biography: text })}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
