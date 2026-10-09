import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY = 'pushToken';

// Show alerts even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Ask permission, get this phone's push token and give it to the server.
// Never throws: if anything fails the app just works without notifications.
export async function registerForPush() {
  try {
    if (!Device.isDevice) return null; // emulators cannot receive push

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Ustad alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== 'granted') return null;

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      console.log('Push: no EAS projectId found');
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.post('/push/register', { token });
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch (error) {
    console.log('Push register failed:', error?.message || error);
    return null;
  }
}

// Call BEFORE clearing the login, so the server stops sending to this phone.
export async function unregisterPush() {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return;
    await api.post('/push/unregister', { token });
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.log('Push unregister failed:', error?.message || error);
  }
}
