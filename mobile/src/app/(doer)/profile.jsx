import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

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
      
      if (response.ok && data.success && data.data) {
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
    if (!profile.primarySkill.trim()) {
      Alert.alert('Incomplete Profile', 'Please specify your primary skill or trade.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const payload = {
        primarySkill: profile.primarySkill.trim(),
        yearsOfExperience: profile.yearsOfExperience ? parseInt(profile.yearsOfExperience, 10) : 0,
        serviceRadius: profile.serviceRadius ? parseInt(profile.serviceRadius, 10) : 25,
        biography: profile.biography.trim(),
      };

      const response = await fetch(`${API_URL}/api/doers/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Profile Saved', 'Your professional profile has been updated.', [
          { text: 'Go to Dashboard', onPress: () => router.replace('/(doer)/dashboard') }
        ]);
      } else {
        Alert.alert('Update Failed', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Connection Error', 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/');
  };

  if (fetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Profile</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroText}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>
              Keep your profile updated to receive relevant job invitations.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PRIMARY SPECIALTY / TRADE *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Master Plumber, Residential Electrician"
                placeholderTextColor="#999999"
                value={profile.primarySkill}
                onChangeText={(text) => setProfile({ ...profile, primarySkill: text })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>YEARS EXP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  value={profile.yearsOfExperience}
                  onChangeText={(text) => setProfile({ ...profile, yearsOfExperience: text })}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>RADIUS (KM)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 25"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  value={profile.serviceRadius}
                  onChangeText={(text) => setProfile({ ...profile, serviceRadius: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PROFESSIONAL BIOGRAPHY</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your expertise, certifications, background, and work ethic..."
                placeholderTextColor="#999999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={profile.biography}
                onChangeText={(text) => setProfile({ ...profile, biography: text })}
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.buttonDisabled]} 
              onPress={handleUpdate} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 20,
  },
  backBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.3,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  logoutBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroText: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 120,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
