import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

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
      Alert.alert('Connection Error', 'Failed to connect to the server');
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
        fetchJobDetails();
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

  const handleLeaveReview = async () => {
    const starNum = parseInt(rating, 10);
    if (!rating || isNaN(starNum) || starNum < 1 || starNum > 5) {
      Alert.alert('Invalid Rating', 'Please select a rating between 1 and 5 stars.');
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
          rating: starNum,
          comment: reviewComment.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Alert.alert('Review Submitted', 'Job marked as completed and review recorded!');
        fetchJobDetails();
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!job) return null;

  const isCompleted = job.status === 'completed';
  const isInProgress = job.status === 'in_progress';
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
          <View style={[
            styles.statusBadge, 
            isOpen && styles.statusBadgeOpen,
            isInProgress && styles.statusBadgeInProgress,
            isCompleted && styles.statusBadgeCompleted,
          ]}>
            <Text style={[
              styles.statusBadgeText,
              isOpen && styles.statusTextOpen,
              isInProgress && styles.statusTextInProgress,
              isCompleted && styles.statusTextCompleted,
            ]}>
              {job.status?.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
        >
          {/* Job Overview Card */}
          <View style={styles.card}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{job.category}</Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.locationText}>📍 {job.location}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.budgetRow}>
              <View>
                <Text style={styles.fieldLabel}>BUDGET</Text>
                <Text style={styles.budgetValue}>
                  {job.budget ? `$${job.budget}` : 'Negotiable'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.fieldLabel}>POSTED ON</Text>
                <Text style={styles.dateValue}>
                  {new Date(job.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.fieldLabel}>DESCRIPTION</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>

          {/* Applications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              APPLICATIONS ({job.applications?.length || 0})
            </Text>

            {job.applications && job.applications.length > 0 ? (
              job.applications.map((app) => {
                const initial = app.doer?.fullName ? app.doer.fullName.charAt(0).toUpperCase() : 'D';
                const isAppPending = app.status === 'pending';
                const isAppAccepted = app.status === 'accepted';
                const isAppRejected = app.status === 'rejected';

                return (
                  <View key={app.id} style={styles.appCard}>
                    <View style={styles.appCardTop}>
                      <View style={styles.appAvatar}>
                        <Text style={styles.appAvatarText}>{initial}</Text>
                      </View>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.applicantName}>{app.doer?.fullName}</Text>
                        <Text style={styles.applicantMeta}>Quote submission</Text>
                      </View>
                      <View style={styles.quotePill}>
                        <Text style={styles.quotePrice}>
                          ${app.proposedPrice || job.budget || 0}
                        </Text>
                      </View>
                    </View>

                    {app.coverLetter ? (
                      <View style={styles.coverLetterWrap}>
                        <Text style={styles.coverLetterText}>"{app.coverLetter}"</Text>
                      </View>
                    ) : null}

                    <View style={styles.appCardBottom}>
                      <View style={[
                        styles.appStatusTag,
                        isAppAccepted && styles.tagAccepted,
                        isAppRejected && styles.tagRejected,
                      ]}>
                        <Text style={[
                          styles.appStatusTagText,
                          isAppAccepted && styles.tagAcceptedText,
                          isAppRejected && styles.tagRejectedText,
                        ]}>
                          {app.status?.toUpperCase()}
                        </Text>
                      </View>

                      {isOpen && isAppPending && (
                        <View style={styles.actionBtnsRow}>
                          <TouchableOpacity 
                            style={styles.rejectBtn}
                            onPress={() => handleApplicationAction(app.id, 'rejected')}
                            disabled={actionLoading}
                          >
                            <Text style={styles.rejectBtnText}>Reject</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.acceptBtn}
                            onPress={() => handleApplicationAction(app.id, 'accepted')}
                            disabled={actionLoading}
                          >
                            <Text style={styles.acceptBtnText}>Accept</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {isAppAccepted && (
                        <View style={styles.actionBtnsRow}>
                          <TouchableOpacity 
                            style={styles.infoBtn}
                            onPress={() => Alert.alert('Professional Contact Info', `Name: ${app.doer?.fullName}\nEmail: ${app.doer?.email}\nPhone: ${app.doer?.phone}`)}
                          >
                            <Text style={styles.infoBtnText}>Contact</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={styles.messageBtn}
                            onPress={() => router.push(`/(messages)/chat?partnerId=${app.doer?.id}&partnerName=${app.doer?.fullName}`)}
                          >
                            <Text style={styles.messageBtnText}>Message</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No Applications Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Qualified professionals will appear here when they submit quotes for this job.
                </Text>
              </View>
            )}
          </View>

          {/* Mark Complete & Review Section */}
          {isInProgress && !job.review && (
            <View style={styles.reviewSection}>
              <Text style={styles.sectionTitle}>COMPLETE & REVIEW</Text>
              <Text style={styles.reviewSubtitle}>
                Has the job been completed satisfactorily? Rate the Doer's performance to finalize this task.
              </Text>
              
              <Text style={styles.fieldLabel}>RATING (1-5 STARS)</Text>
              <View style={styles.starRow}>
                {['1', '2', '3', '4', '5'].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={[styles.starBtn, rating === star && styles.starBtnActive]}
                    onPress={() => setRating(star)}
                  >
                    <Text style={[styles.starBtnText, rating === star && styles.starBtnTextActive]}>
                      ⭐ {star}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>FEEDBACK / COMMENT</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder="Share your experience working with this professional..."
                placeholderTextColor="#999999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity 
                style={[styles.primaryAction, reviewLoading && styles.buttonDisabled]}
                onPress={handleLeaveReview}
                disabled={reviewLoading}
              >
                {reviewLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryActionText}>Mark Completed & Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Completed Review Card */}
          {job.review && (
            <View style={styles.reviewCard}>
              <View style={styles.reviewCardTop}>
                <Text style={styles.fieldLabel}>CLIENT REVIEW</Text>
                <Text style={styles.reviewRating}>⭐ {job.review.rating}/5</Text>
              </View>
              {job.review.comment ? (
                <Text style={styles.reviewBody}>"{job.review.comment}"</Text>
              ) : (
                <Text style={styles.reviewBody}>No additional comments left.</Text>
              )}
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
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  statusBadgeInProgress: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  statusBadgeCompleted: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextOpen: {
    color: '#000000',
  },
  statusTextInProgress: {
    color: '#FFFFFF',
  },
  statusTextCompleted: {
    color: '#888888',
  },

  // --- Job Overview Card ---
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 20,
    marginTop: 16,
  },
  jobTitle: {
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
  metaChip: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaChipText: {
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
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldLabel: {
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
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
  },

  // --- Applications Section ---
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  appCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 12,
    overflow: 'hidden',
  },
  appCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  appAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  applicantMeta: {
    fontSize: 12,
    color: '#999999',
  },
  quotePill: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quotePrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  coverLetterWrap: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  coverLetterText: {
    fontSize: 14,
    color: '#555555',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  appCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  appStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EEEEEE',
  },
  tagAccepted: {
    backgroundColor: '#000000',
  },
  tagRejected: {
    backgroundColor: '#F5F5F5',
  },
  appStatusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
  },
  tagAcceptedText: {
    color: '#FFFFFF',
  },
  tagRejectedText: {
    color: '#999999',
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  rejectBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
  },
  acceptBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  infoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  infoBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
  },
  messageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  messageBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // --- Review Section ---
  reviewSection: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 20,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  starBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#FAFAFA',
  },
  starBtnActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  starBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  starBtnTextActive: {
    color: '#FFFFFF',
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
    marginBottom: 16,
  },
  textArea: {
    height: 80,
  },
  primaryAction: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  reviewCard: {
    marginTop: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 20,
  },
  reviewCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewRating: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  reviewBody: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#333333',
    lineHeight: 22,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
