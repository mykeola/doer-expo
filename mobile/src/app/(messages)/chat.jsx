import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

export default function ChatScreen() {
  const { partnerId, partnerName } = useLocalSearchParams();
  const router = useRouter();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessagesQuietly, 3000);
    return () => clearInterval(interval);
  }, [partnerId]);

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Session Expired', 'Please log in to chat.');
        router.back();
        return;
      }
      await fetchMessagesQuietly();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesQuietly = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/chat/${partnerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const messageContent = inputText.trim();
    setInputText('');
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          receiverId: partnerId,
          content: messageContent
        })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setMessages(prev => [...prev, data.data]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not send message');
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = String(item.senderId) !== String(partnerId);
    
    return (
      <View style={[styles.bubbleWrap, isMine ? styles.myWrap : styles.theirWrap]}>
        <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isMine ? styles.myTimestamp : styles.theirTimestamp]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const partnerInitial = partnerName ? partnerName.charAt(0).toUpperCase() : '?';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerUser}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{partnerInitial}</Text>
          </View>
          <View>
            <Text style={styles.headerTitle} numberOfLines={1}>{partnerName || 'Conversation'}</Text>
            <Text style={styles.headerStatus}>Active</Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : (
        <KeyboardAvoidingView 
          style={styles.chatContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>Start a Conversation</Text>
                <Text style={styles.emptySubtitle}>
                  Say hello to {partnerName || 'your contact'} to begin discussing job details.
                </Text>
              </View>
            }
          />

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#999999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    paddingHorizontal: 12,
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
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginLeft: 12,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  headerStatus: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messageList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  bubbleWrap: {
    marginBottom: 10,
    maxWidth: '82%',
  },
  myWrap: {
    alignSelf: 'flex-end',
  },
  theirWrap: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
    fontWeight: '600',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  theirTimestamp: {
    color: '#999999',
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    maxHeight: 100,
    color: '#000000',
  },
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#999999',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
