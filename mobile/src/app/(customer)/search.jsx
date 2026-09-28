import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.166.209.25:5000';

export default function SearchScreen() {
  const { query, category } = useLocalSearchParams();
  const router = useRouter();
  
  const [doers, setDoers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoers();
  }, [query, category]);

  const fetchDoers = async () => {
    setLoading(true);
    try {
      // Fetch all doers from the backend
      const response = await fetch(`${API_URL}/api/doers`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        let results = data.data;

        // Simple filtering on the frontend based on the search param
        if (query) {
          const lowerQuery = query.toLowerCase();
          results = results.filter(doer => 
            (doer.primarySkill && doer.primarySkill.toLowerCase().includes(lowerQuery)) ||
            (doer.biography && doer.biography.toLowerCase().includes(lowerQuery)) ||
            (doer.user && doer.user.fullName.toLowerCase().includes(lowerQuery))
          );
        } else if (category) {
          const lowerCat = category.toLowerCase();
          results = results.filter(doer => 
            doer.primarySkill && doer.primarySkill.toLowerCase().includes(lowerCat)
          );
        }

        setDoers(results);
      }
    } catch (error) {
      console.error('Error fetching doers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDoer = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: "/(customer)/doer/[id]", params: { id: item.id } })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.doerName}>{item.user ? item.user.fullName : 'Unknown Doer'}</Text>
        <Text style={styles.rating}>⭐ {item.averageRating || 'New'}</Text>
      </View>
      <Text style={styles.skill}>{item.primarySkill}</Text>
      <Text style={styles.experience}>{item.yearsOfExperience} years experience</Text>
      <Text style={styles.location}>📍 {item.user?.location || 'Location not set'}</Text>
      {item.verificationStatus === 'approved' && (
        <Text style={styles.verified}>✓ Verified</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {query ? `Search: "${query}"` : category ? `Category: ${category}` : 'All Professionals'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      ) : doers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No Doers found for this search.</Text>
        </View>
      ) : (
        <FlatList
          data={doers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDoer}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
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
  loader: {
    marginTop: 50,
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  doerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rating: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: 'bold',
  },
  skill: {
    fontSize: 16,
    color: '#0066cc',
    marginBottom: 5,
  },
  experience: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  verified: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  }
});
