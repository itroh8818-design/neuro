/**
 * NER NeuroSmriti - Main App Entry Point
 * AI-based Cognitive Gaming and Memory Assistance Platform
 * For Elderly Dementia Patients in North Eastern Region
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, touchTarget, shadows } from './src/config/theme';
import { useAppStore } from './src/store/useAppStore';
import { initI18n } from './src/i18n';
import { useTranslation } from 'react-i18next';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { GamesScreen } from './src/screens/GamesScreen';
import { GamePlayScreen } from './src/screens/GamePlayScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { RemindersScreen } from './src/screens/RemindersScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { requestNotificationPermissions } from './src/services/reminders';
import { setupConnectivityListener, startPeriodicSync } from './src/services/sync';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Screen = 'Onboarding' | 'Home' | 'Games' | 'GamePlay' | 'Progress' | 'Reminders' | 'Settings';

function AppContent() {
  const { initializeApp, isLoading, hasCompletedOnboarding } = useAppStore();
  const [currentScreen, setCurrentScreen] = useState<Screen>('Onboarding');
  const [gameType, setGameType] = useState<string>('memory_match');
  const { t } = useTranslation();

  useEffect(() => {
    initializeApp();
    requestNotificationPermissions();
    setupConnectivityListener();
    startPeriodicSync();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setCurrentScreen(hasCompletedOnboarding ? 'Home' : 'Onboarding');
    }
  }, [isLoading, hasCompletedOnboarding]);

  const navigateTo = (screen: Screen, params?: { gameType?: string }) => {
    if (params?.gameType) {
      setGameType(params.gameType);
    }
    setCurrentScreen(screen);
  };

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  // Onboarding
  if (!hasCompletedOnboarding || currentScreen === 'Onboarding') {
    return <OnboardingScreen />;
  }

  // Navigation wrapper
  const NavigationBar = ({ title, showBack = true }: { title: string; showBack?: boolean }) => (
    <View style={styles.navBar}>
      {showBack ? (
        <TouchableOpacity
          style={styles.navBack}
          onPress={() => setCurrentScreen('Home')}
          activeOpacity={0.7}
        >
          <Text style={styles.navBackText}>← {t('common.back')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.navBack} />
      )}
      <Text style={styles.navTitle}>{title}</Text>
      <View style={styles.navBack} />
    </View>
  );

  // Tab bar
  const TabBar = () => {
    const tabs = [
      { screen: 'Home' as Screen, icon: '🏠', label: t('home.playGames').split(' ')[0] },
      { screen: 'Games' as Screen, icon: '🎮', label: 'Games' },
      { screen: 'Progress' as Screen, icon: '📊', label: 'Progress' },
      { screen: 'Reminders' as Screen, icon: '⏰', label: 'Reminders' },
      { screen: 'Settings' as Screen, icon: '⚙️', label: 'Settings' },
    ];

    return (
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.screen}
            style={[styles.tabItem, currentScreen === tab.screen && styles.tabItemActive]}
            onPress={() => setCurrentScreen(tab.screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, currentScreen === tab.screen && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen navigation={{ navigate: (s: string, p?: any) => navigateTo(s as Screen, p) }} />;
      case 'Games':
        return <GamesScreen navigation={{ navigate: (s: string, p?: any) => navigateTo(s as Screen, p) }} />;
      case 'GamePlay':
        return (
          <GamePlayScreen
            route={{ params: { gameType: gameType as any } }}
            navigation={{ goBack: () => setCurrentScreen('Games') }}
          />
        );
      case 'Progress':
        return <ProgressScreen />;
      case 'Reminders':
        return <RemindersScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen navigation={{ navigate: (s: string, p?: any) => navigateTo(s as Screen, p) }} />;
    }
  };

  const screenTitles: Record<string, string> = {
    Home: t('app.name'),
    Games: t('games.title'),
    GamePlay: '',
    Progress: t('progress.title'),
    Reminders: t('reminders.title'),
    Settings: t('settings.title'),
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {currentScreen !== 'GamePlay' && (
        <NavigationBar title={screenTitles[currentScreen] || ''} showBack={currentScreen !== 'Home'} />
      )}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      {currentScreen !== 'GamePlay' && <TabBar />}
    </SafeAreaView>
  );
}

export default function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AppContent />
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 20,
    color: colors.textSecondary,
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.overlayLight,
    backgroundColor: colors.background,
  },
  navBack: {
    width: 80,
  },
  navBackText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  navTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.overlayLight,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    minWidth: 60,
  },
  tabItemActive: {
    backgroundColor: colors.primary + '20',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
