"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  patientName?: string;
}

const getBotResponse = (input: string, lang: string): string => {
  const lower = input.toLowerCase();
  
  const responses: Record<string, Record<string, string>> = {
    greeting: {
      en: "Hello! I'm your NeuroSmriti AI assistant. How can I help you today?",
      as: "নমস্কাৰ! মই আপোনাৰ NeuroSmriti AI সহায়ক। আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰো?",
      mn: "মৈতৈ লেইবা! মোই ইমশিংগী NeuroSmriti AI উত্থান। ইমশিংনি মোগী যাগদা লৈবরা?",
    },
    games: {
      en: "We have 6 fun games for you:\n🃏 Memory Match - Match card pairs\n🎯 Pattern Recall - Remember color sequences\n📋 Daily Routine - Order daily activities\n🔍 Object ID - Identify everyday objects\n🧩 Focus Test - Find highlighted cells\n😊 Emotion Match - Match feelings to situations\n\nWhich one would you like to play?",
      as: "আমি আপোনাৰ বাবে ৬টা মজাদাৰ খেল আছে:\n🃏 মেমৰি মেচ - কাৰ্ড জুটি মিলাওক\n🎯 পেটাৰ্ন ৰিকল - ৰঙৰ ক্ৰম মনত ৰাখক\n📋 দৈনিক দিনচৰ্যা - কাৰ্যকলাপ সাজাওক\n🔍 বস্তু চিনাক্ত - দৈনিক বস্তু চিনাক্ত কৰক\n🧩 ফ'কাচ পৰীক্ষা - উজ্জ্বল ঘৰ বিচাৰি উলিওৱক\n😊 অনুভূতি মিল - অনুভূতি মিলাওক\n\nআপুনি যিটো খেলিব খোঁদাই নেকি?",
      mn: "ইমশিংনি ৰেবা ৬ খেল লৈরে:\n🃏 মেমৰি মেচ - কাৰ্ড জুটি মিলাউরো\n🎯 পেটাৰ্ন ৰিকল - ৰঙগী ক্ৰম মনদা লৈ\n📋 নুংমদা দিনচৰ্যা - কাৰ্যকলাপ সাজাউরো\n🔍 বস্তু চিনাক্ত - নুংমদা বস্তু চিনাক্ত তৌরো\n🧩 ফ'কাচ পৰীক্ষা - উজ্জ্বল ঘৰ থিবা খন্দক শিজিন্নু\n😊 অনুভূতি মিল - অনুভূতি মিলাউরো\n\nইমশিংনি যাংদা খেল খেলবরা?",
    },
    memory: {
      en: "Memory Match is great for improving your memory! Cards will be shown face-down. Remember their positions and match the pairs. Start with Easy mode and work your way up!",
      as: "মেমৰি মেচ আপোনাৰ মেমৰি উন্নত কৰিবলে দারুণ! কাৰ্ডসমূহ ওলোটা দেখুওৱা হ'ব। তেওঁকৰ স্থান মনত ৰাখক আৰু জুটি মিলাওক। সহজ মোডত আৰম্ভ কৰক!",
      mn: "মেমৰি মেচ ইমশিংগী মেমৰি যাগবলে য়ারে! কাৰ্ড মমল ওলোটা উনলিং। তেওংগী স্থান মনদা লৈ অমসুং জুটি মিলাউরো। শহজদা তৌনো!",
    },
    medicine: {
      en: "Remember to take your medicine on time! It's important for your health. If you need help remembering, I can remind you. Would you like me to set a reminder?",
      as: "সময়মতে ওষুধ খোৱা নিশ্চিত কৰক! ই আপোনাৰ স্বাস্থ্যৰ বাবে গুৰুত্বপূৰ্ণ। মনত ৰাখিবলে সহায় লাগিলে, মই সোঁৱৰণি দিব পাৰো।",
      mn: "ওষুধ মতমদা শিবরো! ইমশিংগী স্বাস্থ্যগী মতুংদা। মনদা লৈবগী য়ারে উত্থান তৌবগীদমক, মোই পোতশিবা দিবা য়াগনি।",
    },
    water: {
      en: "Stay hydrated! Try to drink water every 2 hours. Water helps your brain function better and keeps you healthy. Would you like a water reminder?",
      as: "পানী খাওক! প্ৰতি ২ ঘণ্টাত পানী খোৱাৰ চেষ্টা কৰক। পানীয়ে আপোনাৰ মস্তিষ্কক ভালদৰে কাম কৰিবলে সহায় কৰে।",
      mn: "ইশিং শিবরো! মাইরি ২ ঘণ্টাদা ইশিং শিবগী চেষ্টা তৌরো। ইশিংনা ইমশিংগী মপুং যাগবা থোক্লে।",
    },
    exercise: {
      en: "Light exercise is very important! A short walk or gentle stretching can help you feel better. Even 10 minutes of movement is beneficial. Shall we plan some exercises?",
      as: "হালকা ব্যায়াম বহুতে গুৰুত্বপূৰ্ণ! এটা চুটি হাঁপুৱা বা মৃদু ষ্ট্ৰেচিংয়ে আপোনাক ভাল অনুভূতি কৰিবলে সহায় কৰে।",
      mn: "শোকজা ব্যায়াম য়ারে মতুংদা! অপুংবা হাঁপুৱা নত্রগা মৃদু ষ্ট্ৰেচিংনা ইমশিংনি যাগবা থোক্লে।",
    },
    mood: {
      en: "How are you feeling today? It's okay to have different feelings. Would you like to play the Emotion Match game to explore your feelings?",
      as: "আজি আপোনাৰ কেনেকৈ লাগে? বিভিন্ন অনুভূতি থকা স্বাভাবিক। আপোনাৰ অনুভূতি অনুসন্ধান কৰিবলে অনুভূতি মিল খেল খেলিব খোঁদাই নেকি?",
      mn: "ইমশিংনি ইমশিংনি যাগদা লৈগদি? তোন্দোইনা অনুভূতি লৈবা চাংদা। ইমশিংগী অনুভূতি শিজিনবলে অনুভূতি মিল কেল খেলবরা?",
    },
    default: {
      en: "I'm here to help! You can ask me about:\n🎮 Games\n💊 Medicine\n💧 Water\n🚶 Exercise\n😊 Mood\n\nJust type or use the voice assistant!",
      as: "মই আপোনাক সহায় কৰিবলে আছো! আপুনি মোক এইসমূহৰ বিষয়ে সুধিব পাৰে:\n🎮 খেল\nওষুধ\n💧 পানী\n🚶 ব্যায়াম\n😊 মনোভাব\n\nটাইপ কৰক বা ভয়েস সহায়ক ব্যৱহাৰ কৰক!",
      mn: "মোই ইমশিংনি য়ারে উত্থান তৌবলে লৈবরো! ইমশিংনি মোগী এশিংবা মথৌ পুচিবা য়াগনি:\n🎮 কেল\n💊 ওষুধ\n💧 ইশিং\n🚶 ব্যায়াম\n😊 মনোভাব\n\nটাইপ তৌরো নত্রগা ভয়েস উত্থান শিজিন্নু!",
    },
  };

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("নমস্কাৰ") || lower.includes("মৈতৈ")) {
    return responses.greeting[lang] || responses.greeting.en;
  }
  if (lower.includes("game") || lower.includes("play") || lower.includes("খেল") || lower.includes("কেল")) {
    return responses.games[lang] || responses.games.en;
  }
  if (lower.includes("memory") || lower.includes("মেমৰি")) {
    return responses.memory[lang] || responses.memory.en;
  }
  if (lower.includes("medicine") || lower.includes("pill") || lower.includes("ওষুধ")) {
    return responses.medicine[lang] || responses.medicine.en;
  }
  if (lower.includes("water") || lower.includes("drink") || lower.includes("পানী") || lower.includes("ইশিং")) {
    return responses.water[lang] || responses.water.en;
  }
  if (lower.includes("exercise") || lower.includes("walk") || lower.includes("ব্যায়াম")) {
    return responses.exercise[lang] || responses.exercise.en;
  }
  if (lower.includes("mood") || lower.includes("feeling") || lower.includes("মনোভাব")) {
    return responses.mood[lang] || responses.mood.en;
  }
  
  return responses.default[lang] || responses.default.en;
};

export default function Chatbot({ patientName = "Patient" }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Record<string, string> = {
        en: `Hello ${patientName}! I'm your NeuroSmriti AI assistant. How can I help you today?`,
        as: `নমস্কাৰ ${patientName}! মই আপোনাৰ NeuroSmriti AI সহায়ক। আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰো?`,
        mn: `মৈতৈ লেইবা ${patientName}! মোই ইমশিংগী NeuroSmriti AI উত্থান। ইমশিংনি মোগী যাগদা লৈবরা?`,
      };
      setMessages([{
        id: 1,
        text: greeting[language] || greeting.en,
        isBot: true,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, language, patientName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // BUG (fixed): ids were computed from `messages.length` captured in the
  // handleSend closure. Because setMessages had not re-rendered yet, two
  // messages sent in quick succession could compute the same id, producing
  // duplicate React keys (silently breaks list reconciliation). Using a
  // monotonically increasing counter avoids relying on stale state.
  const nextIdRef = useRef(1);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: nextIdRef.current++,
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botResponse = getBotResponse(input, language);
      const botMsg: Message = {
        id: nextIdRef.current++,
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 ${
          isOpen
            ? "bg-gray-500 hover:bg-gray-600"
            : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 z-50 border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">NeuroSmriti AI</p>
                <p className="text-xs text-teal-100">Always here to help</p>
              </div>
            </div>
          </div>

          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      msg.isBot
                        ? "bg-gray-100 text-gray-800 rounded-tl-none"
                        : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-tr-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder={language === "as" ? "আপোনাৰ বাৰ্তা টাইপ কৰক..." : language === "mn" ? "ইমশিংগী বাৰ্তা টাইপ তৌরো..." : "Type your message..."}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
