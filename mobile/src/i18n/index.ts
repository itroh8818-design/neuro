import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import as from './as.json';
import hi from './hi.json';

const LANGUAGE_STORAGE_KEY = '@cognicare_language';

const resources = {
  en: { translation: en },
  as: { translation: as },
  hi: { translation: hi },
};

const getStoredLanguage = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored || 'en';
  } catch {
    return 'en';
  }
};

export const initI18n = async () => {
  const storedLang = await getStoredLanguage();

  i18n.use(initReactI18next).init({
    resources,
    lng: storedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
};

export const changeLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
};

export const getStoredLanguageCode = async (): Promise<string> => {
  try {
    return (await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)) || 'en';
  } catch {
    return 'en';
  }
};

export default i18n;
