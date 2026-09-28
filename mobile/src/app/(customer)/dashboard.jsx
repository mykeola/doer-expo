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

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => router.push(`/(customer)/job/${item.id}`)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.jobCategory}>{item.category} • {item.location}</Text>
      
      <View style={styles.applicationsContainer}>
        <Text style={styles.applicationsText}>
          {item.applications && item.applications.length > 0 
            ? `${item.applications.length} Applications` 
            : 'No applications yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.postJobButton}
          onPress={() => router.push('/(customer)/post-job')}
        >
          <Text style={styles.postJobText}>+ Post a New Job</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => router.push('/(customer)/search')}
        >
          <Text style={styles.searchText}>Browse Doers</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: '#e6f4ea', borderColor: '#28a745' }]}
          onPress={() => router.push('/(messages)/inbox')}
        >
          <Text style={[styles.searchText, { color: '#28a745' }]}>Messages</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>My Posted Jobs</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>You haven't posted any jobs yet.</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderJobItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  postJobButton: {
    flex: 1,
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  postJobText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchText: {
    color: '#0066cc',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  loader: {
    marginTop: 50,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_open: {
    backgroundColor: '#e6f4ea',
  },
  status_in_progress: {
    backgroundColor: '#e8f0fe',
  },
  status_completed: {
    backgroundColor: '#fce8e6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  jobCategory: {
    color: '#666',
    marginBottom: 12,
  },
  applicationsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  applicationsText: {
    color: '#0066cc',
    fontWeight: '600',
  }
});
