"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  patientName?: string;
}

export default function VoiceAssistant({ onCommand, patientName = "Patient" }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  const { language, t } = useLanguage();
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const w = window as any;
      const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLangCode(language);

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        setTranscript(text);
        processCommand(text.toLowerCase());
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      synthRef.current = window.speechSynthesis;
    }
  }, [language]);

  const getLangCode = (lang: string) => {
    switch (lang) {
      case "as": return "as-IN";
      case "mn": return "bn-IN";
      default: return "en-US";
    }
  };

  const processCommand = useCallback((text: string) => {
    const responses: Record<string, { en: string; as: string; mn: string }> = {
      hello: {
        en: `Hello ${patientName}! How are you today?`,
        as: `নমস্কাৰ ${patientName}! আজি আপোনাৰ কেনেকৈ আছে?`,
        mn: `মৈতৈ লেইবা ${patientName}! ইমশিং যাগদা লৈবরা?`,
      },
      game: {
        en: "Let's play a game! Would you like Memory Match or Pattern Recall?",
        as: "চলক খেল খেলোঁ! আপুনি মেমৰি মেচ নে পেটাৰ্ন ৰিকল খেলিব খোঁদাই নেকি?",
        mn: "কেল তৌবলে! ইমশিংনি মেমৰি মেচ নত্রগা পেটাৰ্ন ৰিকল খেলবরা?",
      },
      medicine: {
        en: "Time for your medicine! Please take your pills with water.",
        as: "আপোনাৰ ওষুধ খোৱাৰ সময় হৈছে! অনুগ্ৰহ কৰি পানীৰ লগত ওষুধ খাওক।",
        mn: "ইমশিংগী ওষুধ শিবগী মতম লৱরে! ইশিং অমসুং ওষুধ শিবরো।",
      },
      water: {
        en: "Stay hydrated! Please drink some water.",
        as: "পানী খাওক! অনুগ্ৰহ কৰি কিছু পানী খাওক।",
        mn: "ইশিং শিবরো! কদমক ইশিং শিবরো।",
      },
      exercise: {
        en: "Time for some light exercise! Let's move your body.",
        as: "হালকা ব্যায়ামৰ সময়! চলক শৰীৰ সঞ্চলন কৰোঁ।",
        mn: "শোকজা ব্যায়ামগী মতম! শরীর সঞ্চলন তৌবলে।",
      },
      help: {
        en: "I'm here to help! You can ask me about games, medicine, water, or exercise.",
        as: "মই আপোনাক সহায় কৰিবলে আছো! আপুনি মোক খেল, ওষুধ, পানী বা ব্যায়াম সম্পৰ্কে সুধিব পাৰে।",
        mn: "মোই ইমশিংনি য়ারে উত্থান তৌবলে লৈবরো! ইমশিংনি মোগী কেল, ওষুধ, ইশিং নত্রগা ব্যায়াম মথৌ পুচিবা য়াগনি।",
      },
      default: {
        en: "I'm your AI assistant. Say 'help' to know what I can do!",
        as: "মই আপোনাৰ AI সহায়ক। মোৰে যি কৰিব পাৰো জানিবলৈ 'সহায়' কৈ কৈক!",
        mn: "মোই ইমশিংগী AI উত্থান। মোগী যাগদা তৌবা য়াগনি খন খঙদোই 'উত্থান' খন্দা হৈ শিজিন্নু!",
      },
    };

    let matchedKey = "default";
    if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("নমস্কাৰ")) {
      matchedKey = "hello";
    } else if (text.includes("game") || text.includes("play") || text.includes("খেল")) {
      matchedKey = "game";
    } else if (text.includes("medicine") || text.includes("pill") || text.includes("ওষুধ")) {
      matchedKey = "medicine";
    } else if (text.includes("water") || text.includes("drink") || text.includes("পানী")) {
      matchedKey = "water";
    } else if (text.includes("exercise") || text.includes("walk") || text.includes("ব্যায়াম")) {
      matchedKey = "exercise";
    } else if (text.includes("help") || text.includes("সহায়")) {
      matchedKey = "help";
    }

    const langCode = language as "en" | "as" | "mn";
    const responseText = responses[matchedKey][langCode] || responses[matchedKey].en;
    setResponse(responseText);
    
    if (soundEnabled) {
      speak(responseText);
    }

    if (onCommand) {
      onCommand(matchedKey);
    }
  }, [language, soundEnabled, onCommand, patientName]);

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangCode(language);
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setResponse("");
    recognitionRef.current.lang = getLangCode(language);
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-0 shadow-md bg-gradient-to-r from-gray-100 to-gray-200">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-500">Voice assistant not supported in this browser</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md bg-gradient-to-r from-teal-50 to-emerald-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">AI Voice Assistant</p>
              <p className="text-xs text-gray-500">{isListening ? "Listening..." : "Tap to speak"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-8 w-8"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mb-3 p-2 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-400 mb-1">You said:</p>
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mb-3 p-2 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-xs text-teal-600 mb-1">Assistant:</p>
            <p className="text-sm text-teal-800">{response}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
            className={`flex-1 h-12 font-semibold ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Speaking
              </>
            )}
          </Button>
          
          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              className="h-12"
            >
              <VolumeX className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        {/* Quick Commands */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { key: "hello", label: "👋 Hello", en: "Hello", as: "নমস্কাৰ", mn: "মৈতৈ" },
            { key: "game", label: "🎮 Game", en: "Game", as: "খেল", mn: "কেল" },
            { key: "medicine", label: "💊 Medicine", en: "Medicine", as: "ওষুধ", mn: "ওষুধ" },
            { key: "water", label: "💧 Water", en: "Water", as: "পানী", mn: "ইশিং" },
            { key: "exercise", label: "🚶 Exercise", en: "Exercise", as: "ব্যায়াম", mn: "ব্যায়াম" },
          ].map((cmd) => (
            <button
              key={cmd.key}
              onClick={() => {
                setTranscript(cmd[language as keyof typeof cmd] || cmd.en);
                processCommand(cmd.key);
              }}
              className="px-3 py-1.5 text-xs bg-white rounded-full border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
