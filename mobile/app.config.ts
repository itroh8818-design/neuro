import type { ExpoConfig } from 'expo/config';
import appJson from './app.json';

const config = {
  ...appJson.expo,
  extra: {
    bhashiniApiUrl: process.env.BHASHINI_API_URL,
    bhashiniApiKey: process.env.BHASHINI_API_KEY,
  },
} as ExpoConfig;

export default config;
