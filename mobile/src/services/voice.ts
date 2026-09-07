/**
 * Voice Service - Bhashini API Integration
 * Handles speech recognition (ASR), text-to-speech (TTS), and voice commands
 */
import { Platform } from 'react-native';

const BHASHINI_API_URL = 'https://api.bhashini.gov.in';
const BHASHINI_API_KEY = ''; // Set via environment config

interface BhashiniResponse {
  output: string;
  confidence: number;
}

/**
 * Convert text to speech using Bhashini API
 */
export const textToSpeech = async (
  text: string,
  language: string = 'en'
): Promise<void> => {
  try {
    // Map language codes to Bhashini format
    const langMap: Record<string, string> = {
      en: 'en-IN',
      as: 'as-IN',
      hi: 'hi-IN',
    };

    const lang = langMap[language] || 'en-IN';

    // Use Bhashini TTS API
    const response = await fetch(`${BHASHINI_API_URL}/services/inference/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BHASHINI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        config: {
          language: { sourceLanguage: lang },
          voice: { gender: 'female' },
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Play the audio - in production, use expo-av to play the returned audio
      console.log('TTS played:', text);
    }
  } catch (error) {
    console.error('TTS error:', error);
    // Fallback to device TTS
    fallbackTTS(text);
  }
};

/**
 * Speech-to-text using Bhashini API
 */
export const speechToText = async (
  audioUri: string,
  language: string = 'en'
): Promise<BhashiniResponse> => {
  try {
    const langMap: Record<string, string> = {
      en: 'en-IN',
      as: 'as-IN',
      hi: 'hi-IN',
    };

    const lang = langMap[language] || 'en-IN';

    // Read audio file and send to Bhashini
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/wav',
      name: 'recording.wav',
    } as any);
    formData.append('language', lang);

    const response = await fetch(`${BHASHINI_API_URL}/services/inference/asr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BHASHINI_API_KEY}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return {
        output: data.output || '',
        confidence: data.confidence || 0.8,
      };
    }
  } catch (error) {
    console.error('ASR error:', error);
  }

  return { output: '', confidence: 0 };
};

/**
 * Process voice commands
 */
export const processVoiceCommand = async (
  text: string,
  language: string = 'en'
): Promise<{ command: string; params?: any }> => {
  const lowerText = text.toLowerCase().trim();

  // Command mappings for different languages
  const commands: Record<string, string[]> = {
    help: ['help', 'সহায়', 'मदद', 'sahay', 'madad'],
    next: ['next', 'পৰৱৰ্তী', 'अगला', 'agla'],
    back: ['back', 'পিছলৈ', 'पीछे', 'pichhe'],
    play: ['play', 'play game', 'খেলক', 'खेलें', 'khelak'],
    easier: ['easier', 'সহজ', 'आसान', 'asan', 'sohoj'],
    harder: ['harder', 'কঠিন', 'कठिन', 'kathin'],
    repeat: ['repeat', 'পুনৰাবৃত্তি', 'फिर से', 'dobara'],
    stop: ['stop', 'বন্ধ', 'रुकें', 'ruk'],
    take_medicine: ['take medicine', 'ওষুধ', 'दवाई', 'davai', 'oushodh'],
    drink_water: ['drink water', 'পানী', 'पानी', 'pani'],
  };

  for (const [command, keywords] of Object.entries(commands)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return { command };
      }
    }
  }

  return { command: 'unknown' };
};

/**
 * Fallback TTS using device native speech
 */
const fallbackTTS = (text: string) => {
  // In production, use expo-speech
  console.log('Fallback TTS:', text);
};

/**
 * Get available languages for voice
 */
export const getAvailableVoiceLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];
