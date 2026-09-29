import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

export default function DoerJobDetailsScreen() {
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
      Alert.alert('Connection Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      Alert.alert('Missing Cover Letter', 'Please provide a message or proposal to the client.');
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
          coverLetter: coverLetter.trim(),
          proposedPrice: proposedPrice ? parseFloat(proposedPrice) : null
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Alert.alert('Application Submitted', 'Your proposal was sent to the client!', [
          { text: 'OK', onPress: () => router.replace('/(doer)/job-board') }
        ]);
      } else {
        Alert.alert('Submission Error', data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Connection Error', 'Failed to connect to server');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!job) return null;

  const isOpen = job.status === 'open';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <View style={[styles.statusBadge, isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed]}>
            <Text style={[styles.statusBadgeText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
              {job.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Job Info Card */}
          <View style={styles.card}>
            <Text style={styles.title}>{job.title}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{job.category}</Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.locationText}>📍 {job.location}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsGrid}>
              <View style={styles.detailCol}>
                <Text style={styles.metaLabel}>CLIENT BUDGET</Text>
                <Text style={styles.budgetValue}>
                  {job.budget ? `$${job.budget}` : 'Negotiable'}
                </Text>
              </View>

              <View style={styles.detailCol}>
                <Text style={styles.metaLabel}>POSTED BY</Text>
                <Text style={styles.clientName}>{job.customer?.fullName || 'Client'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.metaLabel}>PROJECT DETAILS</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>

          {/* Assigned Banner */}
          {job.isAssignedToMe && (
            <View style={styles.assignedCard}>
              <View style={styles.assignedBadge}>
                <Text style={styles.assignedBadgeText}>✓ YOU ARE ASSIGNED</Text>
              </View>
              <Text style={styles.assignedTitle}>You got the job!</Text>
              <Text style={styles.assignedSubtitle}>
                Reach out to the client to coordinate schedule, materials, and project kick-off.
              </Text>
              <TouchableOpacity 
                style={styles.primaryAction}
                onPress={() => router.push(`/(messages)/chat?partnerId=${job.customerId}&partnerName=${job.customer?.fullName}`)}
              >
                <Text style={styles.primaryActionText}>Message Client</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Proposal / Application Form */}
          {isOpen && !job.isAssignedToMe && (
            <View style={styles.proposalSection}>
              <Text style={styles.sectionTitle}>SUBMIT YOUR PROPOSAL</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>YOUR PROPOSED PRICE ($)</Text>
                <TextInput
                  style={styles.input}
                  value={proposedPrice}
                  onChangeText={setProposedPrice}
                  keyboardType="numeric"
                  placeholder="e.g. 150"
                  placeholderTextColor="#999999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>COVER LETTER / PROPOSAL NOTE *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  placeholder="Explain your relevant experience, when you can start, and why you are the best fit..."
                  placeholderTextColor="#999999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryAction, applying && styles.buttonDisabled]}
                onPress={handleApply}
                disabled={applying}
              >
                {applying ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryActionText}>Submit Application</Text>
                )}
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
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeOpen: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  statusBadgeClosed: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextOpen: {
    color: '#000000',
  },
  statusTextClosed: {
    color: '#FFFFFF',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 20,
    marginTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dot: {
    color: '#999999',
  },
  locationText: {
    fontSize: 13,
    color: '#666666',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999999',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
  },

  // --- Assigned Section ---
  assignedCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  assignedBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  assignedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  assignedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 6,
  },
  assignedSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  // --- Proposal Form ---
  proposalSection: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 6,
    marginBottom: 14,
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
    paddingVertical: 12,
    fontSize: 15,
    color: '#000000',
  },
  textArea: {
    height: 100,
  },
  primaryAction: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
