/**
 * Reminders Screen
 * Manage reminders for medicine, hydration, daily activities, and appointments
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LargeText } from '../components/ui/LargeText';
import { LargeButton } from '../components/ui/LargeButton';
import { HighContrastCard } from '../components/ui/HighContrastCard';
import { colors, spacing, borderRadius, touchTarget } from '../config/theme';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import {
  createReminder,
  getUserReminders,
  deleteReminderById,
  setupDefaultReminders,
} from '../services/reminders';
import { Reminder, ReminderType } from '../models/types';

export const RemindersScreen: React.FC = () => {
  const { currentUser } = useAppStore();
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminderType, setNewReminderType] = useState<ReminderType>('medicine');
  const [newReminderTime, setNewReminderTime] = useState('08:00');
  const [newReminderTitle, setNewReminderTitle] = useState('');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    if (!currentUser) return;
    const userReminders = await getUserReminders(currentUser.id);
    setReminders(userReminders);
  };

  const handleAddReminder = async () => {
    if (!currentUser) return;

    await createReminder(
      currentUser.id,
      newReminderType,
      newReminderTitle || t(`reminders.${newReminderType}`),
      newReminderTime
    );

    setShowAddModal(false);
    setNewReminderTitle('');
    loadReminders();
  };

  const handleDeleteReminder = async (reminderId: string) => {
    await deleteReminderById(reminderId);
    loadReminders();
  };

  const handleSetupDefaults = async () => {
    if (!currentUser) return;
    await setupDefaultReminders(currentUser.id);
    loadReminders();
  };

  const reminderTypes: { type: ReminderType; icon: string; color: string }[] = [
    { type: 'medicine', icon: '💊', color: '#4CAF50' },
    { type: 'hydration', icon: '💧', color: '#2196F3' },
    { type: 'daily_activity', icon: '🧠', color: '#FF9800' },
    { type: 'appointment', icon: '📅', color: '#9C27B0' },
  ];

  const groupedReminders = reminderTypes.map((rt) => ({
    ...rt,
    reminders: reminders.filter((r) => r.type === rt.type),
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <LargeText size="xxl" weight="bold">
          ⏰ {t('reminders.title')}
        </LargeText>
      </View>

      {/* Quick setup button */}
      {reminders.length === 0 && (
        <HighContrastCard style={styles.setupCard}>
          <LargeText size="md" align="center" style={styles.setupText}>
            {t('reminders.noReminders')}
          </LargeText>
          <LargeButton
            title="🔄 Setup Default Reminders"
            onPress={handleSetupDefaults}
            variant="primary"
            size="medium"
          />
        </HighContrastCard>
      )}

      {/* Reminder groups */}
      {groupedReminders.map((group) => (
        <View key={group.type} style={styles.reminderGroup}>
          <View style={[styles.groupHeader, { backgroundColor: group.color + '20' }]}>
            <LargeText style={styles.groupIcon}>{group.icon}</LargeText>
            <LargeText size="lg" weight="bold" style={{ color: group.color }}>
              {t(`reminders.${group.type === 'daily_activity' ? 'dailyActivity' : group.type}Reminders`)}
            </LargeText>
            <LargeText size="sm" color={colors.textSecondary}>
              ({group.reminders.length})
            </LargeText>
          </View>

          {group.reminders.length === 0 ? (
            <HighContrastCard style={styles.emptyGroupCard}>
              <LargeText size="sm" color={colors.textSecondary}>
                {t('reminders.noReminders')}
              </LargeText>
            </HighContrastCard>
          ) : (
            group.reminders.map((reminder) => (
              <HighContrastCard key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderRow}>
                  <View style={styles.reminderInfo}>
                    <LargeText size="md" weight="bold">
                      {reminder.title}
                    </LargeText>
                    <LargeText size="sm" color={colors.textSecondary}>
                      ⏰ {reminder.time} • {t('reminders.everyDay')}
                    </LargeText>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteReminder(reminder.id)}
                  >
                    <LargeText size="md">🗑️</LargeText>
                  </TouchableOpacity>
                </View>
              </HighContrastCard>
            ))
          )}
        </View>
      ))}

      {/* Add reminder button */}
      <LargeButton
        title={`➕ ${t('reminders.addReminder')}`}
        onPress={() => setShowAddModal(true)}
        variant="accent"
        size="large"
        fullWidth
        style={styles.addButton}
      />

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LargeText size="xl" weight="bold" align="center">
              ➕ {t('reminders.addReminder')}
            </LargeText>

            {/* Reminder type selection */}
            <LargeText size="md" style={styles.modalLabel}>
              {t('reminders.chooseActivity')}
            </LargeText>
            <View style={styles.typeSelector}>
              {reminderTypes.map((rt) => (
                <TouchableOpacity
                  key={rt.type}
                  style={[
                    styles.typeOption,
                    newReminderType === rt.type && { borderColor: rt.color, backgroundColor: rt.color + '20' },
                  ]}
                  onPress={() => setNewReminderType(rt.type)}
                >
                  <LargeText style={{ fontSize: 28 }}>{rt.icon}</LargeText>
                  <LargeText size="sm">{t(`reminders.${rt.type}`)}</LargeText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title */}
            <LargeText size="md" style={styles.modalLabel}>
              Title
            </LargeText>
            <TextInput
              style={styles.input}
              value={newReminderTitle}
              onChangeText={setNewReminderTitle}
              placeholder={t(`reminders.${newReminderType}`)}
              placeholderTextColor={colors.textSecondary}
            />

            {/* Time */}
            <LargeText size="md" style={styles.modalLabel}>
              {t('reminders.setTime')}
            </LargeText>
            <TextInput
              style={styles.input}
              value={newReminderTime}
              onChangeText={setNewReminderTime}
              placeholder="HH:MM (e.g., 08:00)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numbers-and-punctuation"
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <LargeButton
                title={t('common.cancel')}
                onPress={() => setShowAddModal(false)}
                variant="outline"
                size="medium"
                style={{ flex: 1 }}
              />
              <LargeButton
                title={t('common.save')}
                onPress={handleAddReminder}
                variant="primary"
                size="medium"
                style={{ flex: 1 }}
              />
            </View>
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
  header: {
    marginBottom: spacing.xl,
  },
  setupCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  setupText: {
    color: colors.textSecondary,
  },
  reminderGroup: {
    marginBottom: spacing.xl,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  groupIcon: {
    fontSize: 24,
  },
  emptyGroupCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  reminderCard: {
    marginBottom: spacing.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  addButton: {
    marginTop: spacing.md,
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
  modalLabel: {
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.overlayLight,
    minWidth: 80,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 22,
    borderWidth: 2,
    borderColor: colors.overlayLight,
    color: colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});

export default RemindersScreen;
