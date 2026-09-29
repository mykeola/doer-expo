import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, ScrollView 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Handyman', 'Painting', 'Moving', 'Technology'];

export default function JobBoardScreen() {
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
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

  const filteredJobs = jobs.filter(job => {
    if (selectedCategory === 'All') return true;
    return job.category && job.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/(doer)/job/${item.id}`)}
    >
      <View style={styles.jobCardTop}>
        <View style={styles.titleWrap}>
          <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.jobMeta}>{item.category} • {item.location}</Text>
        </View>
        <View style={styles.budgetPill}>
          <Text style={styles.budgetText}>
            {item.budget ? `$${item.budget}` : 'Flexible'}
          </Text>
        </View>
      </View>

      <View style={styles.jobCardMiddle}>
        <Text style={styles.jobDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.jobCardBottom}>
        <Text style={styles.postedByText}>Client: {item.customer?.fullName || 'Client'}</Text>
        <Text style={styles.applyLinkText}>View & Apply →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Board</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredJobs.length}</Text>
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat, i) => {
            const active = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <TouchableOpacity
                key={i}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Jobs List */}
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#000000" style={styles.loader} />
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Jobs Available</Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory === 'All'
                ? 'There are no open jobs at the moment. Check back soon!'
                : `No open jobs in ${selectedCategory}. Try viewing all categories.`}
            </Text>
            {selectedCategory !== 'All' && (
              <TouchableOpacity 
                style={styles.resetBtn} 
                onPress={() => setSelectedCategory('All')}
              >
                <Text style={styles.resetBtnText}>View All Categories</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
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
  countBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  filterSection: {
    paddingVertical: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loader: {
    marginTop: 50,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 30,
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
  },
  jobCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 10,
  },
  titleWrap: {
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
  budgetPill: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
  },
  jobCardMiddle: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },
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
  postedByText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
  },
  applyLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
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
    lineHeight: 20,
    marginBottom: 20,
  },
  resetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 20,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
});
