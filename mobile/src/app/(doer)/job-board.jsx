import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.166.209.25:5000';

export default function JobBoardScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/jobs`, {
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
      fetchJobs();
    }, [])
  );

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => router.push(`/(doer)/job/${item.id}`)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        {item.budget && (
          <Text style={styles.jobBudget}>${item.budget}</Text>
        )}
      </View>
      <Text style={styles.jobCategory}>{item.category} • {item.location}</Text>
      
      <Text style={styles.jobDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.postedBy}>Posted by: {item.customer?.fullName}</Text>
        <Text style={styles.applyText}>View & Apply →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Jobs</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No open jobs available right now.</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButtonText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  jobBudget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  jobCategory: {
    color: '#666',
    marginBottom: 10,
    fontSize: 14,
  },
  jobDescription: {
    color: '#444',
    marginBottom: 15,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  postedBy: {
    color: '#888',
    fontSize: 12,
  },
  applyText: {
    color: '#0066cc',
    fontWeight: 'bold',
  }
});
