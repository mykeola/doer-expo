import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.166.209.25:5000';

export default function CustomerJobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [rating, setRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleLeaveReview = async () => {
    if (!rating || isNaN(rating) || parseInt(rating) < 1 || parseInt(rating) > 5) {
      Alert.alert('Error', 'Please enter a valid rating between 1 and 5.');
      return;
    }

    setReviewLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/jobs/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          rating: parseInt(rating),
          comment: reviewComment
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Alert.alert('Success', 'Review submitted and job marked as completed!');
        fetchJobDetails(); // Refresh job to see review and completed status
      } else {
        Alert.alert('Error', data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setReviewLoading(false);
    }
  };

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

  const handleApplicationAction = async (appId, status) => {
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/jobs/${id}/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Alert.alert('Success', `Application ${status} successfully!`);
        fetchJobDetails(); // Refresh to get updated statuses
      } else {
        Alert.alert('Error', data.message || 'Failed to update application');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setActionLoading(false);
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.jobHeader}>
          <Text style={styles.title}>{job.title}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{job.category}</Text>
            </View>
            <View style={[styles.badge, styles[`status_${job.status}`]]}>
              <Text style={[styles.badgeText, { color: job.status === 'open' ? '#333' : '#fff' }]}>
                {job.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{job.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Budget:</Text>
            <Text style={styles.detailValue}>{job.budget ? `$${job.budget}` : 'Negotiable'}</Text>
          </View>
        </View>

        <View style={styles.applicationsSection}>
          <Text style={styles.sectionTitle}>
            Applications ({job.applications?.length || 0})
          </Text>
          
          {job.applications && job.applications.length > 0 ? (
            job.applications.map((app) => (
              <View key={app.id} style={styles.applicationCard}>
                <View style={styles.appHeader}>
                  <Text style={styles.doerName}>{app.doer?.fullName}</Text>
                  <Text style={styles.proposedPrice}>
                    ${app.proposedPrice || job.budget || 0}
                  </Text>
                </View>
                
                <Text style={styles.coverLetter}>{app.coverLetter}</Text>
                
                <View style={styles.appFooter}>
                  <Text style={[styles.appStatus, styles[`appStatus_${app.status}`]]}>
                    {app.status.toUpperCase()}
                  </Text>
                  
                  {job.status === 'open' && app.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.rejectButton}
                        onPress={() => handleApplicationAction(app.id, 'rejected')}
                        disabled={actionLoading}
                      >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleApplicationAction(app.id, 'accepted')}
                        disabled={actionLoading}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {app.status === 'accepted' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.contactButton}
                        onPress={() => Alert.alert('Contact', `Email: ${app.doer?.email}\nPhone: ${app.doer?.phone}`)}
                      >
                        <Text style={styles.contactButtonText}>Info</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.contactButton, { backgroundColor: '#28a745' }]}
                        onPress={() => router.push(`/(messages)/chat?partnerId=${app.doer?.id}&partnerName=${app.doer?.fullName}`)}
                      >
                        <Text style={styles.contactButtonText}>Message</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No Doers have applied yet.</Text>
            </View>
          )}
        </View>

        {job.status === 'in_progress' && !job.review && (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Mark Job Completed & Leave Review</Text>
            
            <Text style={styles.inputLabel}>Rating (1-5)</Text>
            <TextInput
              style={styles.input}
              value={rating}
              onChangeText={setRating}
              keyboardType="numeric"
              placeholder="5"
            />

            <Text style={styles.inputLabel}>Comments</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="How was the Doer's work?"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={[styles.reviewButton, reviewLoading && styles.reviewButtonDisabled]}
              onPress={handleLeaveReview}
              disabled={reviewLoading}
            >
              <Text style={styles.reviewButtonText}>
                {reviewLoading ? 'Submitting...' : 'Submit Review & Complete Job'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {job.review && (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <View style={styles.reviewCard}>
              <Text style={styles.ratingText}>⭐ {job.review.rating}/5</Text>
              {job.review.comment ? (
                <Text style={styles.commentText}>{job.review.comment}</Text>
              ) : null}
            </View>
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
    backgroundColor: '#f4f6f8',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 15,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  status_open: { backgroundColor: '#e6f4ea' },
  status_in_progress: { backgroundColor: '#0066cc' },
  status_completed: { backgroundColor: '#28a745' },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
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
  applicationsSection: {
    marginTop: 10,
  },
  applicationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  doerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  proposedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  coverLetter: {
    color: '#555',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  appStatus: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  appStatus_pending: { color: '#f39c12' },
  appStatus_accepted: { color: '#28a745' },
  appStatus_rejected: { color: '#dc3545' },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  rejectButtonText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  acceptButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#28a745',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contactButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#0066cc',
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  emptyStateText: {
    color: '#888',
    fontStyle: 'italic',
  },
  reviewSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
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
    height: 100,
  },
  reviewButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  reviewButtonDisabled: {
    backgroundColor: '#8bc34a',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 10,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 16,
    color: '#444',
    fontStyle: 'italic',
  }
});
