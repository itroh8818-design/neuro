/**
 * Settings Screen
 * User preferences, language, accessibility, and profile settings
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { LargeText } from '../components/ui/LargeText';
import { HighContrastCard } from '../components/ui/HighContrastCard';
import { colors, spacing, borderRadius, touchTarget } from '../config/theme';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

export const SettingsScreen: React.FC = () => {
  const {
    currentUser,
    highContrast,
    fontSize,
    language,
    voiceEnabled,
    setHighContrast,
    setFontSize,
    setLanguage,
    setVoiceEnabled,
    setUser,
  } = useAppStore();
  const { t } = useTranslation();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);

  const handleLanguageChange = async (lang: 'en' | 'as' | 'hi') => {
    setLanguage(lang);
    await changeLanguage(lang);
    if (currentUser) {
      await setUser({ ...currentUser, language: lang, updatedAt: new Date().toISOString() });
    }
    setShowLanguageModal(false);
  };

  const handleFontSizeChange = async (size: 'small' | 'medium' | 'large' | 'extraLarge') => {
    setFontSize(size);
    if (currentUser) {
      await setUser({ ...currentUser, fontSize: size, updatedAt: new Date().toISOString() });
    }
    setShowFontSizeModal(false);
  };

  const handleHighContrastToggle = async () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    if (currentUser) {
      await setUser({ ...currentUser, highContrast: newValue, updatedAt: new Date().toISOString() });
    }
  };

  const handleVoiceToggle = async () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    if (currentUser) {
      await setUser({ ...currentUser, voiceEnabled: newValue, updatedAt: new Date().toISOString() });
    }
  };

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'as' as const, name: 'Assamese', flag: '🇮🇳' },
    { code: 'hi' as const, name: 'Hindi', flag: '🇮🇳' },
  ];

  const fontSizes = [
    { key: 'small' as const, label: t('settings.small'), size: 18 },
    { key: 'medium' as const, label: t('settings.medium'), size: 22 },
    { key: 'large' as const, label: t('settings.large'), size: 26 },
    { key: 'extraLarge' as const, label: t('settings.extraLarge'), size: 32 },
  ];

  const getLanguageLabel = () => {
    return languages.find((l) => l.code === language)?.name || 'English';
  };

  const getFontSizeLabel = () => {
    return fontSizes.find((f) => f.key === fontSize)?.label || 'Medium';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <LargeText size="xxl" weight="bold">
        ⚙️ {t('settings.title')}
      </LargeText>

      {/* Profile */}
      <HighContrastCard style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.profileAvatar}>
            <LargeText size="xl">👤</LargeText>
          </View>
          <View style={styles.profileInfo}>
            <LargeText size="lg" weight="bold">{currentUser?.name}</LargeText>
            <LargeText size="sm" color={colors.textSecondary}>
              Age: {currentUser?.age}
            </LargeText>
          </View>
        </View>
      </HighContrastCard>

      {/* Settings list */}
      <View style={styles.settingsList}>
        {/* Language */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowLanguageModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <LargeText style={styles.settingIcon}>🌐</LargeText>
            <LargeText size="md">{t('settings.language')}</LargeText>
          </View>
          <LargeText size="md" color={colors.primary}>{getLanguageLabel()}</LargeText>
        </TouchableOpacity>

        {/* Font Size */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowFontSizeModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <LargeText style={styles.settingIcon}>🔤</LargeText>
            <LargeText size="md">{t('settings.fontSize')}</LargeText>
          </View>
          <LargeText size="md" color={colors.primary}>{getFontSizeLabel()}</LargeText>
        </TouchableOpacity>

        {/* High Contrast */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <LargeText style={styles.settingIcon}>🔲</LargeText>
            <LargeText size="md">{t('settings.highContrast')}</LargeText>
          </View>
          <Switch
            value={highContrast}
            onValueChange={handleHighContrastToggle}
            trackColor={{ false: colors.overlayLight, true: colors.primary + '80' }}
            thumbColor={highContrast ? colors.primary : '#f4f3f4'}
            style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
          />
        </View>

        {/* Voice */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <LargeText style={styles.settingIcon}>🎤</LargeText>
            <LargeText size="md">{t('settings.voiceEnabled')}</LargeText>
          </View>
          <Switch
            value={voiceEnabled}
            onValueChange={handleVoiceToggle}
            trackColor={{ false: colors.overlayLight, true: colors.primary + '80' }}
            thumbColor={voiceEnabled ? colors.primary : '#f4f3f4'}
            style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
          />
        </View>
      </View>

      {/* About section */}
      <HighContrastCard style={styles.aboutCard}>
        <LargeText size="lg" weight="bold" align="center">
          🧠 {t('app.name')}
        </LargeText>
        <LargeText size="sm" align="center" color={colors.textSecondary}>
          v1.0.0 • {t('app.tagline')}
        </LargeText>
        <LargeText size="xs" align="center" color={colors.textSecondary} style={styles.aboutDesc}>
          An AI-powered cognitive gaming platform for elderly dementia patients
          in the North Eastern Region of India.
        </LargeText>
      </HighContrastCard>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LargeText size="xl" weight="bold" align="center">
              {t('onboarding.chooseLanguage')}
            </LargeText>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.modalOption,
                  language === lang.code && styles.modalOptionSelected,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <LargeText style={{ fontSize: 32 }}>{lang.flag}</LargeText>
                <LargeText size="lg">{lang.name}</LargeText>
                {language === lang.code && <LargeText size="md">✓</LargeText>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Font Size Modal */}
      <Modal
        visible={showFontSizeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFontSizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LargeText size="xl" weight="bold" align="center">
              {t('settings.fontSize')}
            </LargeText>

            {fontSizes.map((fs) => (
              <TouchableOpacity
                key={fs.key}
                style={[
                  styles.modalOption,
                  fontSize === fs.key && styles.modalOptionSelected,
                ]}
                onPress={() => handleFontSizeChange(fs.key)}
              >
                <LargeText size={fontSize === fs.key ? 'lg' : 'md'}>
                  {fs.label}
                </LargeText>
                <LargeText style={{ fontSize: fs.size }}>Aa</LargeText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    gap: spacing.xs,
  },
  settingsList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: touchTarget.recommended,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingIcon: {
    fontSize: 24,
  },
  aboutCard: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  aboutDesc: {
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.overlayLight,
    minHeight: touchTarget.recommended,
  },
  modalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E9',
  },
});

export default SettingsScreen;
