import { saveCustomerPushToken, removeCustomerPushToken } from "../lib/customerApi";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  // SDK 53+ Check: Push notifications are not supported in Expo Go
  if (Constants.appOwnership === 'expo') {
    console.warn('Push notifications are not supported in Expo Go (SDK 53+). Use a development build to test remote notifications.');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || "38a64c1b-a244-4f07-ae9c-f2e285e307ea";
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (e) {
      console.error('Error getting push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function savePushTokenToSupabase(userId: string, token: string) {
  if (!userId || !token) return;

  try {
    await saveCustomerPushToken(token, Platform.OS || "android");
    console.log('Push token successfully saved via customer backend API');
  } catch (err) {
    console.error('Unexpected error saving push token:', err);
  }
}

export async function removePushTokenFromSupabase(token: string) {
  if (!token) return;

  try {
    await removeCustomerPushToken(token);
    console.log('Push token successfully removed via customer backend API');
  } catch (err) {
    console.error('Unexpected error removing push token:', err);
  }
}
