import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.166.209.25:5000';

export default function DoerDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

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
        setProfile(data.data);
      } else {
        router.push('/(doer)/profile'); // Force them to create a profile if it fails
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Could not load profile data.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(doer)/profile')}>
          <Text style={styles.buttonText}>Go to Edit Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {profile.user?.fullName}</Text>
          <View style={[styles.statusBadge, profile.verificationStatus === 'approved' ? styles.statusApproved : styles.statusPending]}>
            <Text style={styles.statusText}>
              {profile.verificationStatus === 'approved' ? '✓ Verified' : 'Pending Verification'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>⭐ {profile.averageRating || 'N/A'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.yearsOfExperience}</Text>
            <Text style={styles.statLabel}>Years Exp</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.card}>
            <Text style={styles.detailLabel}>Primary Skill:</Text>
            <Text style={styles.detailText}>{profile.primarySkill}</Text>
            
            <View style={styles.divider} />

            <Text style={styles.detailLabel}>Biography:</Text>
            <Text style={styles.detailText}>{profile.biography}</Text>

            <View style={styles.divider} />
            
            <Text style={styles.detailLabel}>Contact Email:</Text>
            <Text style={styles.detailText}>{profile.user?.email}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryAction} 
            onPress={() => router.push('/(doer)/job-board')}
          >
            <Text style={styles.primaryActionText}>Find Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction} 
            onPress={() => router.push('/(messages)/inbox')}
          >
            <Text style={[styles.secondaryActionText, { color: '#28a745', borderColor: '#28a745' }]}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction} 
            onPress={() => router.push('/(doer)/profile')}
          >
            <Text style={[styles.secondaryActionText, { color: '#0066cc', borderColor: '#0066cc' }]}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryAction} 
            onPress={handleLogout}
          >
            <Text style={styles.secondaryActionText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusApproved: {
    backgroundColor: '#d4edda',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  actionButtons: {
    marginTop: 10,
    gap: 15,
  },
  primaryAction: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryAction: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  secondaryActionText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 20,
  }
});
