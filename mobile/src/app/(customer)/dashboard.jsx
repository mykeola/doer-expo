import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.166.209.25:5000';

export default function CustomerDashboardScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMyJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/jobs/my-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setJobs(data.data);
      } else {
        console.error('Failed to fetch jobs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMyJobs();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/');
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'OPEN';
      case 'in_progress': return 'IN PROGRESS';
      case 'completed': return 'COMPLETED';
      default: return status?.toUpperCase();
    }
  };

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => router.push(`/(customer)/job/${item.id}`)}
    >
      <View style={styles.jobCardTop}>
        <View style={styles.jobTitleWrap}>
          <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.jobMeta}>{item.category} • {item.location}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          item.status === 'open' && styles.statusOpen,
          item.status === 'in_progress' && styles.statusInProgress,
          item.status === 'completed' && styles.statusCompleted,
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'open' && styles.statusTextOpen,
            item.status === 'in_progress' && styles.statusTextInProgress,
            item.status === 'completed' && styles.statusTextCompleted,
          ]}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      <View style={styles.jobCardBottom}>
        <Text style={styles.applicationsText}>
          {item.applications && item.applications.length > 0 
            ? `${item.applications.length} application${item.applications.length > 1 ? 's' : ''}` 
            : 'No applications yet'}
        </Text>
        <Text style={styles.viewText}>View →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={styles.primaryAction}
          onPress={() => router.push('/(customer)/post-job')}
        >
          <Text style={styles.primaryActionText}>+ Post a New Job</Text>
        </TouchableOpacity>

        <View style={styles.secondaryRow}>
          <TouchableOpacity 
            style={styles.secondaryAction}
            onPress={() => router.push('/(customer)/search')}
          >
            <Text style={styles.secondaryActionText}>Browse Doers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction}
            onPress={() => router.push('/(messages)/inbox')}
          >
            <Text style={styles.secondaryActionText}>Messages</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Jobs List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>My Posted Jobs</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#000000" style={styles.loader} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No jobs posted yet</Text>
            <Text style={styles.emptySubtitle}>Tap "Post a New Job" above to get started.</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderJobItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
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

  // --- Divider ---
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
  },

  // --- Jobs List ---
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 30,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
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

  // --- Job Cards ---
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
  },
  jobCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  jobTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: 13,
    color: '#999999',
  },

  // --- Status Badges ---
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusOpen: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  statusInProgress: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  statusCompleted: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextOpen: {
    color: '#000000',
  },
  statusTextInProgress: {
    color: '#FFFFFF',
  },
  statusTextCompleted: {
    color: '#999999',
  },

  // --- Job Card Footer ---
  jobCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  applicationsText: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
  },
  viewText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});

