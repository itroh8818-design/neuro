/**
 * Reminder Service
 * Handles scheduling, notifications, and voice reminders
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder, ReminderType, ReminderLog } from '../models/types';
import {
  saveReminder,
  getReminders,
  deleteReminder as deleteReminderFromDb,
  logReminderAction,
} from './storage';
import { generateId } from './encryption';
import { textToSpeech } from './voice';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
};

/**
 * Schedule a reminder notification
 */
export const scheduleReminder = async (reminder: Reminder): Promise<string[] | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Parse time
    const [hours, minutes] = reminder.time.split(':').map(Number);

    const content = {
      title: getReminderTitle(reminder.type),
      body: getReminderBody(reminder),
      data: { reminderId: reminder.id },
      sound: reminder.soundEnabled,
    };

    // BUG (fixed): reminder.days (e.g. weekdays only) was stored but never
    // used — every reminder was scheduled with a DAILY trigger, so it fired
    // every day even if the caregiver only selected specific days.
    // days: 0 = Sunday ... 6 = Saturday (matches Date.getDay()).
    // expo-notifications' WEEKLY trigger uses weekday: 1 = Sunday ... 7 = Saturday.
    const allDaysSelected = reminder.days.length === 7;

    if (allDaysSelected) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
      await saveReminder(reminder);
      return [notificationId];
    }

    // Schedule one weekly-recurring notification per selected day.
    const notificationIds = await Promise.all(
      reminder.days.map((day) =>
        Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day + 1, // convert 0-6 (Sun-Sat) to expo's 1-7 (Sun-Sat)
            hour: hours,
            minute: minutes,
          },
        })
      )
    );

    await saveReminder(reminder);
    return notificationIds;
  } catch (error) {
    console.error('Failed to schedule reminder:', error);
    return null;
  }
};

/**
 * Cancel a scheduled reminder
 */
export const cancelReminder = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

/**
 * Delete a reminder
 */
export const deleteReminderById = async (reminderId: string): Promise<void> => {
  await deleteReminderFromDb(reminderId);
};

/**
 * Log a reminder action (dismiss, snooze, complete)
 */
export const handleReminderAction = async (
  reminderId: string,
  userId: string,
  action: 'dismissed' | 'snoozed' | 'completed'
): Promise<void> => {
  const log: ReminderLog = {
    id: generateId(),
    reminderId,
    userId,
    action,
    timestamp: new Date().toISOString(),
  };

  await logReminderAction(log);

  // If snoozed, schedule another notification in 10 minutes
  if (action === 'snoozed') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Reminder (Snoozed)',
        body: 'This is your snoozed reminder.',
        data: { reminderId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 600, // 10 minutes
      },
    });
  }
};

/**
 * Get all reminders for a user
 */
export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  return await getReminders(userId);
};

/**
 * Create a new reminder with defaults
 */
export const createReminder = async (
  userId: string,
  type: ReminderType,
  title: string,
  time: string,
  days: number[] = [0, 1, 2, 3, 4, 5, 6], // Every day
  description?: string
): Promise<Reminder> => {
  const reminder: Reminder = {
    id: generateId(),
    userId,
    type,
    title,
    description,
    time,
    days,
    enabled: true,
    soundEnabled: true,
    voiceEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await scheduleReminder(reminder);
  return reminder;
};

/**
 * Setup default reminders for a new user
 */
export const setupDefaultReminders = async (userId: string): Promise<void> => {
  // Medicine reminders
  await createReminder(userId, 'medicine', 'Morning Medicine', '08:00');
  await createReminder(userId, 'medicine', 'Evening Medicine', '20:00');

  // Hydration reminders
  await createReminder(userId, 'hydration', 'Drink Water', '10:00');
  await createReminder(userId, 'hydration', 'Drink Water', '14:00');
  await createReminder(userId, 'hydration', 'Drink Water', '18:00');

  // Daily activity reminder
  await createReminder(userId, 'daily_activity', 'Play a Game', '16:00');
};

// Helper functions
function getReminderTitle(type: ReminderType): string {
  const titles: Record<ReminderType, string> = {
    medicine: '💊 Time for Medicine',
    hydration: '💧 Time to Drink Water',
    daily_activity: '🧠 Time for Brain Exercise',
    appointment: '📅 Appointment Reminder',
  };
  return titles[type];
}

function getReminderBody(reminder: Reminder): string {
  const bodies: Record<ReminderType, string> = {
    medicine: 'Please take your medicine now.',
    hydration: 'Time to drink some water. Stay hydrated!',
    daily_activity: 'Time for your daily cognitive exercise!',
    appointment: `Don\'t forget: ${reminder.title}`,
  };
  return bodies[reminder.type];
}

/**
 * Play voice reminder
 */
export const playVoiceReminder = async (
  reminder: Reminder,
  language: string = 'en'
): Promise<void> => {
  if (!reminder.voiceEnabled) return;

  const voiceMessages: Record<string, Record<ReminderType, string>> = {
    en: {
      medicine: 'Time to take your medicine. Please take it now.',
      hydration: 'Time to drink some water. Stay healthy!',
      daily_activity: 'Time for your brain exercise. Let\'s play a game!',
      appointment: 'You have an appointment coming up. Please get ready.',
    },
    as: {
      medicine: 'ওষুধ খাওৰ সময় হৈছে। অনুগ্ৰহ কৰি এতিয়া খাওক।',
      hydration: 'পানী খাওৰ সময় হৈছে। স্বাস্থ্যৱান থাকক!',
      daily_activity: 'মস্তিষ্কৰ ব্যায়ামৰ সময় হৈছে। এটা খেল খেলোঁ!',
      appointment: 'আপোনাৰ সাক্ষাৎ আহি আছে। অনুগ্ৰহ কৰি প্ৰস্তুত হওক।',
    },
    hi: {
      medicine: 'दवाई लेने का समय है। कृपया अभी ले लीजिए।',
      hydration: 'पानी पीने का समय है। स्वस्थ रहिए!',
      daily_activity: 'दिमाग की एक्सरसाइज का समय है। चलो खेलते हैं!',
      appointment: 'जल्द ही आपका अपॉइंटमेंट है। कृपया तैयार हो जाइए।',
    },
  };

  const message = voiceMessages[language]?.[reminder.type] || voiceMessages.en[reminder.type];
  await textToSpeech(message, language);
};
