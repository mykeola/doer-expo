import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, TextInput, ScrollView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Handyman', 'Painting', 'Moving', 'Technology'];

export default function SearchScreen() {
  const { query: initialQuery, category: initialCategory } = useLocalSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [doers, setDoers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoers();
  }, []);

  const fetchDoers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/doers`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDoers(data.data);
      }
    } catch (error) {
      console.error('Error fetching doers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoers = doers.filter(doer => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query || 
      (doer.primarySkill && doer.primarySkill.toLowerCase().includes(query)) ||
      (doer.biography && doer.biography.toLowerCase().includes(query)) ||
      (doer.user && doer.user.fullName.toLowerCase().includes(query)) ||
      (doer.user?.location && doer.user.location.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === 'All' || 
      (doer.primarySkill && doer.primarySkill.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesQuery && matchesCategory;
  });

  const renderDoer = ({ item }) => {
    const isVerified = item.verificationStatus === 'approved';
    const initial = item.user?.fullName ? item.user.fullName.charAt(0).toUpperCase() : 'D';

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: "/(customer)/doer/[id]", params: { id: item.id } })}
      >
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.doerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.doerName} numberOfLines={1}>{item.user?.fullName || 'Professional'}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {item.averageRating || 'New'}</Text>
              </View>
            </View>
            
            <View style={styles.metaRow}>
              <View style={styles.skillPill}>
                <Text style={styles.skillPillText}>{item.primarySkill || 'Specialist'}</Text>
              </View>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.cardMiddle}>
          <Text style={styles.metaDetail}>
            💼 {item.yearsOfExperience || 0} years experience
          </Text>
          <Text style={styles.metaDetail}>
            📍 {item.user?.location || 'Location upon request'}
          </Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.radiusText}>Service radius: {item.serviceRadius || 20} km</Text>
          <Text style={styles.viewLink}>View Profile →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Professionals</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by skill, name, or city..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories Horizontal Filter */}
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

      {/* Results Header */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsCount}>
          {filteredDoers.length} {filteredDoers.length === 1 ? 'professional' : 'professionals'} available
        </Text>
      </View>

      {/* Doers List */}
      {loading ? (
        <ActivityIndicator size="large" color="#000000" style={styles.loader} />
      ) : filteredDoers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No Professionals Found</Text>
          <Text style={styles.emptySubtitle}>
            Try clearing filters or searching for another keyword.
          </Text>
          <TouchableOpacity 
            style={styles.resetBtn} 
            onPress={() => { setSearchQuery(''); setSelectedCategory('All'); }}
          >
            <Text style={styles.resetBtnText}>Reset Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDoers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDoer}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
  searchBarContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000000',
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '800',
  },
  filterSection: {
    paddingVertical: 8,
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
  resultsInfo: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 50,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  doerInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillPill: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skillPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  verifiedBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
  cardMiddle: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 4,
  },
  metaDetail: {
    fontSize: 13,
    color: '#666666',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  radiusText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
  },
  viewLink: {
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
