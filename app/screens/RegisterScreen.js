import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRADES = [
  'Electrician', 'Plumber', 'Painter', 'Carpenter',
  'AC Technician', 'Welder', 'Mechanic', 'General Labor'
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cnic, setCnic] = useState('');
  const [trade, setTrade] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !password || !cnic || !trade || !area) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (cnic.length < 13) {
      Alert.alert('Error', 'Please enter valid CNIC');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/worker/register', {
        name, phone, password, cnic, trade, area
      });

      const { token, worker } = response.data;
      await AsyncStorage.setItem('wtoken', token);
      await AsyncStorage.setItem('worker', JSON.stringify(worker));

      Alert.alert(
        '🎉 Registration Successful!',
        'Aapka account ban gaya! Ab aap login kar sakte hain.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner}>

        <View style={styles.header}>
          <Text style={styles.logo}>اُستاد</Text>
          <Text style={styles.subtitle}>Partner Registration</Text>
          <Text style={styles.tagline}>Worker account banayein</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Register as Worker</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Apna pura naam likhein"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="03XXXXXXXXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>CNIC Number</Text>
          <TextInput
            style={styles.input}
            placeholder="XXXXX-XXXXXXX-X"
            value={cnic}
            onChangeText={setCnic}
            keyboardType="numeric"
            maxLength={15}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Your Trade/Skill</Text>
          <View style={styles.tradesGrid}>
            {TRADES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tradeBtn,
                  trade === t && styles.tradeBtnSelected
                ]}
                onPress={() => setTrade(t)}
              >
                <Text style={[
                  styles.tradeBtnText,
                  trade === t && styles.tradeBtnTextSelected
                ]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your Area/Mohalla</Text>
          <TextInput
            style={styles.input}
            placeholder="Jis area mein kaam karte hain"
            value={area}
            onChangeText={setArea}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password banayein"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password dobara likhein"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Account hai? <Text style={styles.linkBold}>Login karein</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  inner: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    fontSize: 48,
  },
  subtitle: {
    fontSize: 16,
    color: '#9b93ff',
    fontWeight: '600',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tradeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tradeBtnSelected: {
    backgroundColor: '#6353f7',
    borderColor: '#6353f7',
  },
  tradeBtnText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tradeBtnTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#6353f7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkBold: {
    color: '#6353f7',
    fontWeight: 'bold',
  },
});