import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.137.94.25:5000';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'doer'
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please complete all fields to register.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName: fullName.trim(), 
          email: email.trim(), 
          phone: phone.trim(), 
          password, 
          role 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        await AsyncStorage.setItem('userToken', data.data.token);
        
        if (role === 'doer') {
          router.replace('/(doer)/dashboard');
        } else {
          router.replace('/(customer)/dashboard');
        }
      } else {
        Alert.alert('Registration Failed', data.message || 'Please check your information and try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Connection Error', 'Failed to connect to the server. Please check your network connection.');
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
              <Text style={styles.backBtnText}>← Home</Text>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {role === 'customer' 
                ? 'Sign up to hire top professionals for any job.' 
                : 'Sign up to offer your services and find client jobs.'}
            </Text>
          </View>

          {/* Role Toggle */}
          <View style={styles.roleContainer}>
            <Text style={styles.inputLabel}>I WANT TO</Text>
            <View style={styles.roleToggle}>
              <TouchableOpacity 
                style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
                onPress={() => setRole('customer')}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleButtonText, role === 'customer' && styles.roleButtonTextActive]}>
                  Hire Help (Client)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, role === 'doer' && styles.roleButtonActive]}
                onPress={() => setRole('doer')}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleButtonText, role === 'doer' && styles.roleButtonTextActive]}>
                  Work (Professional)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                placeholderTextColor="#999999"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 555 123 4567"
                placeholderTextColor="#999999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Register as {role === 'customer' ? 'Client' : 'Professional'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Log In</Text>
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
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  roleContainer: {
    marginBottom: 20,
    gap: 6,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleButtonActive: {
    backgroundColor: '#000000',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '700',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  form: {
    gap: 16,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    textDecorationLine: 'underline',
  },
});
