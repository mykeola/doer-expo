import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    const term = query || searchQuery;
    if (term.trim()) {
      router.push(`/(customer)/search?query=${encodeURIComponent(term.trim())}`);
    }
  };

  const handleCategoryPress = (category) => {
    router.push(`/(customer)/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>GET IT DONE. GET A DOER.</Text>
          <Text style={styles.heroSubtitle}>Find trusted professionals for almost anything you need.</Text>
        </View>

        <View style={styles.searchSection}>
          <TextInput 
            style={styles.searchInput} 
            placeholder="What do you need help with?" 
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.authButtonsRow}>
            <TouchableOpacity 
              style={[styles.primaryButton, { flex: 1, marginRight: 10 }]}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.primaryButtonText}>Doer Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.outlineButton, { flex: 1 }]}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.outlineButtonText}>Register as Doer</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.emergencyCTA} onPress={() => router.push('/(customer)/search?category=Emergency')}>
            <Text style={styles.emergencyText}>Need Help Now? (Emergency)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.categoriesGrid}>
            {['Plumbing', 'Electrical', 'Cleaning', 'Auto Services', 'Carpentry', 'Technology'].map((cat, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat)}
              >
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  searchSection: {
    marginBottom: 30,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  authButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066cc',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencyCTA: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    width: '48%',
    alignItems: 'center',
  },
  categoryText: {
    fontWeight: '600',
    color: '#444',
  }
});
