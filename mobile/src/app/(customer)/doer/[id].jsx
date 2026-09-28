import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.166.209.25:5000';

export default function DoerPublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [doer, setDoer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    fetchDoerProfile();
  }, [id]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsGuest(!token);
    } catch (e) {
      setIsGuest(true);
    }
  };

  const fetchDoerProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/doers/${id}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDoer(data.data);
      } else {
        Alert.alert('Error', 'Doer profile not found');
        router.back();
      }
    } catch (error) {
      console.error('Fetch doer profile error:', error);
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = () => {
    if (isGuest) {
      Alert.alert('Login Required', 'Please login or register as a client to chat with this professional.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }
    // Alert.alert('Chat feature', `Starting a conversation with ${doer?.user?.fullName}...`);
    router.push({
      pathname: "/(messages)/chat",
      params: { partnerId: doer.user.id, partnerName: doer.user.fullName }
    });
  };

  const handleBookPress = () => {
    if (isGuest) {
      Alert.alert('Login Required', 'Please login or register as a client to request a service.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }
    Alert.alert('Booking', `Requesting a service from ${doer?.user?.fullName}...`);
    // Future: router.push(`/(customer)/book?doerId=${doer.id}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!doer) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professional Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{doer.user?.fullName.charAt(0)}</Text>
          </View>
          <Text style={styles.doerName}>{doer.user?.fullName}</Text>
          <Text style={styles.doerSkill}>{doer.primarySkill}</Text>
          
          <View style={[styles.statusBadge, doer.verificationStatus === 'approved' ? styles.statusApproved : styles.statusPending]}>
            <Text style={styles.statusText}>
              {doer.verificationStatus === 'approved' ? '✓ Verified Professional' : 'Pending Verification'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>⭐ {doer.averageRating || 'N/A'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{doer.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>Jobs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{doer.yearsOfExperience}</Text>
            <Text style={styles.statLabel}>Years Exp</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.biography}>{doer.biography}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{doer.user?.location || 'Not specified'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Area:</Text>
            <Text style={styles.detailValue}>Up to {doer.serviceRadius} km</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact Email:</Text>
            <Text style={styles.detailValue}>
              {isGuest ? '🔒 Hidden for guests (Login to view)' : doer.user?.email}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
          <Text style={styles.chatButtonText}>💬 Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
          <Text style={styles.bookButtonText}>Request Service</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0066cc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 20,
    paddingBottom: 100, // Space for floating buttons
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  doerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  doerSkill: {
    fontSize: 18,
    color: '#0066cc',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusApproved: {
    backgroundColor: '#d4edda',
  },
  statusPending: {
    backgroundColor: '#e2e3e5',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  biography: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: 120,
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 15,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButton: {
    flex: 2,
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  }
});
