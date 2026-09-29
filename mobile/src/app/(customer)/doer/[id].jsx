import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

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
      Alert.alert('Connection Error', 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = () => {
    if (isGuest) {
      Alert.alert('Login Required', 'Please login or register to message this professional.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    router.push({
      pathname: "/(messages)/chat",
      params: { partnerId: doer.user.id, partnerName: doer.user.fullName }
    });
  };

  const handleBookPress = () => {
    if (isGuest) {
      Alert.alert('Login Required', 'Please login or register as a client to post a job or request service.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }
    Alert.alert('Request Service', `Would you like to post a job directly for ${doer?.user?.fullName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Post a Job', onPress: () => router.push('/(customer)/post-job') }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!doer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Profile Not Found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isVerified = doer.verificationStatus === 'approved';
  const initial = doer.user?.fullName ? doer.user.fullName.charAt(0).toUpperCase() : 'D';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professional Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Profile Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.doerName}>{doer.user?.fullName}</Text>
          
          <View style={styles.pillRow}>
            <View style={styles.skillPill}>
              <Text style={styles.skillPillText}>{doer.primarySkill || 'Specialist'}</Text>
            </View>
            <View style={[styles.statusBadge, isVerified ? styles.statusApproved : styles.statusPending]}>
              <Text style={[styles.statusText, isVerified ? styles.statusTextApproved : styles.statusTextPending]}>
                {isVerified ? '✓ VERIFIED DOER' : '• PENDING'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>⭐ {doer.averageRating || 'New'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{doer.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{doer.yearsOfExperience || 0}y</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.card}>
            <Text style={styles.bodyText}>
              {doer.biography || 'This professional has not provided a biography yet.'}
            </Text>
          </View>
        </View>

        {/* Service Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SERVICE DETAILS</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>LOCATION</Text>
              <Text style={styles.detailValue}>{doer.user?.location || 'Not specified'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>SERVICE AREA</Text>
              <Text style={styles.detailValue}>Up to {doer.serviceRadius || 20} km</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>EMAIL</Text>
              <Text style={styles.detailValue}>
                {isGuest ? '🔒 Login to view' : doer.user?.email}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
          <Text style={styles.chatButtonText}>💬 Message</Text>
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
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.3,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 110, // Avoid overlapping floating footer
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  doerName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  skillPill: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  skillPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusApproved: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  statusPending: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextApproved: {
    color: '#000000',
  },
  statusTextPending: {
    color: '#888888',
  },

  // --- Stats Row ---
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- Cards & Content ---
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 18,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999999',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },

  // --- Footer Bar ---
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 15,
  },
  bookButton: {
    flex: 1.4,
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 16,
  },
});
