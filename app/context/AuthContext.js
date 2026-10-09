import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setUnauthorizedHandler } from '../utils/api';
import { registerForPush, unregisterPush } from '../utils/notifications';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const loggedInRef = useRef(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // When the server rejects our saved login, clear it and show the login screen.
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      if (!loggedInRef.current) return; // already logged out, nothing to do
      loggedInRef.current = false;
      await AsyncStorage.removeItem('wtoken');
      await AsyncStorage.removeItem('worker');
      setWorker(null);
      Alert.alert('Session expired', 'Please log in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('wtoken');
      const storedWorker = await AsyncStorage.getItem('worker');
      if (storedToken && storedWorker) {
        loggedInRef.current = true;
        setWorker(JSON.parse(storedWorker));
        registerForPush(); // refresh the push token for an already logged-in worker
      }
    } catch (error) {
      console.log('Auth load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    try {
      const response = await api.post('/auth/worker/login', { phone, password });
      const { token, worker } = response.data;
      await AsyncStorage.setItem('wtoken', token);
      await AsyncStorage.setItem('worker', JSON.stringify(worker));
      loggedInRef.current = true;
      setWorker(worker);
      registerForPush();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    // Tell the server to stop sending alerts to this phone (but never block logout for long).
    await Promise.race([unregisterPush(), new Promise((r) => setTimeout(r, 3000))]);
    loggedInRef.current = false;
    await AsyncStorage.removeItem('wtoken');
    await AsyncStorage.removeItem('worker');
    setWorker(null);
  };

  return (
    <AuthContext.Provider value={{ worker, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
