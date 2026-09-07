/**
 * Onboarding Screen
 * Language selection and profile creation for elderly users
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LargeText } from '../components/ui/LargeText';
import { LargeButton } from '../components/ui/LargeButton';
import { colors, spacing, borderRadius, touchTarget } from '../config/theme';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'as', name: 'Assamese', flag: '🇮🇳', nativeName: 'অসমীয়া' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
];

export const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const { createProfile, setLanguage } = useAppStore();
  const { t } = useTranslation();

  const handleLanguageSelect = async (langCode: string) => {
    setSelectedLanguage(langCode);
    setLanguage(langCode as any);
    await changeLanguage(langCode);
  };

  const handleComplete = async () => {
    if (!name.trim()) return;
    const ageNum = parseInt(age) || 65;
    await createProfile(name.trim(), ageNum);
  };

  // Step 0: Welcome
  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <LargeText size="hero" align="center" style={styles.emoji}>🧠</LargeText>
          <LargeText size="xxl" weight="bold" align="center" style={styles.title}>
            {t('onboarding.welcome')}
          </LargeText>
          <LargeText size="lg" align="center" style={styles.subtitle}>
            {t('onboarding.subtitle')}
          </LargeText>

          <View style={styles.buttonContainer}>
            <LargeButton
              title={t('onboarding.getStarted')}
              onPress={() => setStep(1)}
              variant="primary"
              size="extraLarge"
              icon="👉"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Step 1: Language Selection
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <LargeText size="xl" weight="bold" align="center" style={styles.stepTitle}>
            {t('onboarding.chooseLanguage')}
          </LargeText>

          <View style={styles.languageGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageCard,
                  selectedLanguage === lang.code && styles.languageCardSelected,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
              >
                <LargeText style={styles.flag}>{lang.flag}</LargeText>
                <LargeText size="lg" weight="bold" align="center">
                  {lang.nativeName}
                </LargeText>
                <LargeText size="sm" align="center" style={styles.langName}>
                  {lang.name}
                </LargeText>
              </TouchableOpacity>
            ))}
          </View>

          <LargeButton
            title={t('onboarding.next')}
            onPress={() => setStep(2)}
            variant="primary"
            size="large"
            fullWidth
            style={styles.nextButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Profile Creation
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <LargeText size="xl" weight="bold" align="center" style={styles.stepTitle}>
            👤 {t('settings.profile')}
          </LargeText>
          <LargeText size="md" align="center" style={styles.profileSubtitle}>
            {selectedLanguage === 'as' ? 'আপোনাৰ তথ্য দিয়ক' : selectedLanguage === 'hi' ? 'अपनी जानकारी दें' : 'Tell us about yourself'}
          </LargeText>

          <View style={styles.inputContainer}>
            <LargeText size="md" style={styles.inputLabel}>
              {selectedLanguage === 'as' ? 'আপোনাৰ নাম' : selectedLanguage === 'hi' ? 'आपका नाम' : 'Your Name'}
            </LargeText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={selectedLanguage === 'as' ? 'নাম লিখক' : selectedLanguage === 'hi' ? 'नाम लिखें' : 'Enter your name'}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <LargeText size="md" style={styles.inputLabel}>
              {selectedLanguage === 'as' ? 'বয়স' : selectedLanguage === 'hi' ? 'उम्र' : 'Age'}
            </LargeText>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder={selectedLanguage === 'as' ? 'বয়স লিখক' : selectedLanguage === 'hi' ? 'उम्र लिखें' : 'Enter your age'}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <LargeButton
            title={t('onboarding.done')}
            onPress={handleComplete}
            variant="primary"
            size="extraLarge"
            fullWidth
            disabled={!name.trim()}
            icon="✅"
            style={styles.completeButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emoji: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  stepTitle: {
    marginBottom: spacing.xl,
  },
  languageGrid: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  languageCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.overlayLight,
    minHeight: touchTarget.large,
    justifyContent: 'center',
  },
  languageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E9',
  },
  flag: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  langName: {
    color: colors.textSecondary,
  },
  nextButton: {
    marginTop: spacing.lg,
  },
  profileSubtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  inputLabel: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 24,
    borderWidth: 2,
    borderColor: colors.overlayLight,
    color: colors.textPrimary,
    minHeight: touchTarget.recommended,
  },
  completeButton: {
    marginTop: spacing.lg,
  },
});

export default OnboardingScreen;
