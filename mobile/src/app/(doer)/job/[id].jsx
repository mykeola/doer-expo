import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.166.209.25:5000';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/jobs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setJob(data.data);
        if (data.data.budget) {
          setProposedPrice(data.data.budget.toString());
        }
      } else {
        Alert.alert('Error', 'Could not load job details');
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!coverLetter) {
      Alert.alert('Error', 'Please provide a cover letter or message to the client.');
      return;
    }

    setApplying(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverLetter,
          proposedPrice: proposedPrice ? parseFloat(proposedPrice) : null
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Alert.alert('Success', 'Your application has been submitted!');
        router.replace('/(doer)/job-board');
      } else {
        Alert.alert('Error', data.message || 'Failed to apply');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!job) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back to Jobs</Text>
          </TouchableOpacity>

          <View style={styles.jobHeader}>
            <Text style={styles.title}>{job.title}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{job.category}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#e6f4ea' }]}>
                <Text style={[styles.badgeText, { color: '#137333' }]}>{job.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{job.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Budget:</Text>
              <Text style={styles.detailValue}>{job.budget ? `$${job.budget}` : 'Negotiable'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Posted By:</Text>
              <Text style={styles.detailValue}>{job.customer?.fullName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date Posted:</Text>
              <Text style={styles.detailValue}>{new Date(job.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>

          {job.status === 'open' && (
            <View style={styles.applyContainer}>
              <Text style={styles.sectionTitle}>Submit Application</Text>
              
              <Text style={styles.inputLabel}>Proposed Price ($)</Text>
              <TextInput
                style={styles.input}
                value={proposedPrice}
                onChangeText={setProposedPrice}
                keyboardType="numeric"
                placeholder="e.g. 150"
              />

              <Text style={styles.inputLabel}>Cover Letter / Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={coverLetter}
                onChangeText={setCoverLetter}
                placeholder="Why are you the best person for this job? What's your availability?"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <TouchableOpacity 
                style={[styles.applyButton, applying && styles.applyButtonDisabled]}
                onPress={handleApply}
                disabled={applying}
              >
                <Text style={styles.applyButtonText}>
                  {applying ? 'Submitting...' : 'Apply Now'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {job.isAssignedToMe && (
            <View style={styles.applyContainer}>
              <Text style={styles.sectionTitle}>You are assigned to this job!</Text>
              <Text style={{ marginBottom: 15, color: '#555' }}>
                Communicate with the client to work out the details.
              </Text>
              <TouchableOpacity 
                style={[styles.applyButton, { backgroundColor: '#28a745' }]}
                onPress={() => router.push(`/(messages)/chat?partnerId=${job.customerId}&partnerName=${job.customer?.fullName}`)}
              >
                <Text style={styles.applyButtonText}>Message Client</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
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
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    color: '#333',
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  applyContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 120,
  },
  applyButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonDisabled: {
    backgroundColor: '#80b3e6',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
