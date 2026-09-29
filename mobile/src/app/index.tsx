import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const POPULAR_CATEGORIES = [
  { name: 'Plumbing', icon: '🔧' },
  { name: 'Electrical', icon: '⚡' },
  { name: 'Cleaning', icon: '✨' },
  { name: 'Auto Repair', icon: '🚗' },
  { name: 'Carpentry', icon: '🪚' },
  { name: 'Painting', icon: '🎨' },
  { name: 'Technology', icon: '💻' },
  { name: 'Moving', icon: '📦' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/(customer)/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/(customer)/search');
    }
  };

  const handleCategoryPress = (category: string) => {
    router.push(`/(customer)/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <Text style={styles.brandLogo}>DOER.</Text>
          <TouchableOpacity 
            style={styles.signInBtn} 
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInBtnText}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Get It Done.{"\n"}Get A Doer.</Text>
          <Text style={styles.heroSubtitle}>
            Find trusted, vetted local professionals for almost any task or service.
          </Text>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput} 
            placeholder="What do you need help with?" 
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.primaryAction}
            onPress={() => router.push('/(customer)/post-job')}
          >
            <Text style={styles.primaryActionText}>+ Post a Job</Text>
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
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.secondaryActionText}>Become a Doer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Banner */}
        <TouchableOpacity 
          style={styles.emergencyCard} 
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/search?category=Plumbing')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTag}>24/7 IMMEDIATE DISPATCH</Text>
            <Text style={styles.emergencyTitle}>Need Help Right Now?</Text>
            <Text style={styles.emergencySubtitle}>Connect with available emergency pros</Text>
          </View>
          <Text style={styles.emergencyArrow}>→</Text>
        </TouchableOpacity>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>POPULAR CATEGORIES</Text>
          <View style={styles.categoriesGrid}>
            {POPULAR_CATEGORIES.map((cat, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  brandLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  signInBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 20,
  },
  signInBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  heroSection: {
    marginVertical: 20,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000000',
  },
  searchBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionContainer: {
    gap: 12,
    marginBottom: 20,
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
  emergencyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 18,
    marginBottom: 28,
  },
  emergencyTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#CCCCCC',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  emergencyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: 13,
    color: '#999999',
  },
  emergencyArrow: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '900',
    marginLeft: 10,
  },
  categoriesSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    width: '48%',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontWeight: '700',
    color: '#000000',
    fontSize: 14,
  },
});
