import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

export default function DoerDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

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
        router.push('/(doer)/profile');
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Profile Incomplete</Text>
          <Text style={styles.emptySubtitle}>Please complete your profile to start receiving jobs.</Text>
          <TouchableOpacity 
            style={[styles.primaryAction, { marginTop: 20, width: '100%' }]} 
            onPress={() => router.push('/(doer)/profile')}
          >
            <Text style={styles.primaryActionText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isVerified = profile.verificationStatus === 'approved';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting} numberOfLines={1}>
              {profile.user?.fullName || 'Professional'}
            </Text>
            <View style={[styles.statusBadge, isVerified ? styles.statusApproved : styles.statusPending]}>
              <Text style={[styles.statusText, isVerified ? styles.statusTextApproved : styles.statusTextPending]}>
                {isVerified ? '✓ VERIFIED DOER' : '• PENDING VERIFICATION'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.primaryAction} 
            onPress={() => router.push('/(doer)/job-board')}
          >
            <Text style={styles.primaryActionText}>Browse Available Jobs</Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity 
              style={styles.secondaryAction} 
              onPress={() => router.push('/(messages)/inbox')}
            >
              <Text style={styles.secondaryActionText}>Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryAction} 
              onPress={() => router.push('/(doer)/profile')}
            >
              <Text style={styles.secondaryActionText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>⭐ {profile.averageRating || 'New'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.yearsOfExperience || 0}y</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          
          <View style={styles.overviewCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardMetaLabel}>PRIMARY SPECIALTY</Text>
              <View style={styles.skillPill}>
                <Text style={styles.skillPillText}>{profile.primarySkill || 'Not set'}</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardRow}>
              <Text style={styles.cardMetaLabel}>ABOUT ME</Text>
              <Text style={styles.cardBodyText}>
                {profile.biography || 'No biography added yet. Update your profile to describe your skills.'}
              </Text>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardRow}>
              <Text style={styles.cardMetaLabel}>SERVICE RADIUS</Text>
              <Text style={styles.cardHighlightText}>Up to {profile.serviceRadius || 25} km</Text>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardRow}>
              <Text style={styles.cardMetaLabel}>ACCOUNT EMAIL</Text>
              <Text style={styles.cardBodyText}>{profile.user?.email || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusApproved: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  statusPending: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextApproved: {
    color: '#FFFFFF',
  },
  statusTextPending: {
    color: '#000000',
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 20,
  },
  logoutText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
  },

  // --- Quick Actions ---
  actionsSection: {
    paddingHorizontal: 24,
    marginTop: 8,
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },

  // --- Stats Section ---
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 20,
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
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- Divider ---
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 24,
    marginVertical: 24,
  },

  // --- Overview Section ---
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardRow: {
    gap: 6,
  },
  cardMetaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999999',
    letterSpacing: 0.5,
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
  cardBodyText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
    fontWeight: '500',
  },
  cardHighlightText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 14,
  },

  // --- Empty / Error State ---
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
