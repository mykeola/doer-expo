import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

const SUGGESTED_CATEGORIES = [
  'Plumbing', 'Electrical', 'Cleaning', 'Handyman', 'Painting', 'Moving', 'Tech Support'
];

export default function PostJobScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handlePostJob = async () => {
    if (!title.trim() || !description.trim() || !category.trim() || !location.trim()) {
      Alert.alert('Incomplete Form', 'Please provide a title, category, description, and location.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Session Expired', 'Please log in again to post a job.');
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: title.trim(), 
          description: description.trim(), 
          category: category.trim(), 
          budget: budget ? parseFloat(budget) : null,
          location: location.trim()
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        Alert.alert('Job Posted', 'Your job has been published for Doers to apply!', [
          { text: 'View Dashboard', onPress: () => router.replace('/(customer)/dashboard') }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to post job');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Connection Error', 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Post a New Job</Text>
            <Text style={styles.subtitle}>
              Describe your project so qualified professionals can submit quotes.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>JOB TITLE *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Fix leaking bathroom sink pipe"
                placeholderTextColor="#999999"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CATEGORY *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Plumbing"
                placeholderTextColor="#999999"
                value={category}
                onChangeText={setCategory}
              />
              {/* Category Suggestions */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.chipsScroll}
              >
                {SUGGESTED_CATEGORIES.map((cat, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.chip, category.toLowerCase() === cat.toLowerCase() && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, category.toLowerCase() === cat.toLowerCase() && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DETAILED DESCRIPTION *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Provide details about the task, requirements, timing, and any materials needed..."
                placeholderTextColor="#999999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Budget & Location in 2 Columns */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>BUDGET ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor="#999999"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>LOCATION *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City, State"
                  placeholderTextColor="#999999"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.buttonDisabled]} 
              onPress={handlePostJob}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>+ Publish Job</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBar: {
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 20,
  },
  backBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 6,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
