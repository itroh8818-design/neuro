"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, CheckCircle2, XCircle, ArrowUp, ArrowDown, Volume2, VolumeX, Star } from "lucide-react";
import {
  Sounds,
  DIFFICULTY_LEVELS,
  updateGameStats,
  getGameStats,
} from "@/lib/game-utils";
import { useLanguage } from "@/lib/language-context";

const ROUTINES = [
  {
    title: "Morning Routine",
    activities: [
      { id: 1, emoji: "⏰", name: "Wake Up" },
      { id: 2, emoji: "🛏️", name: "Make the Bed" },
      { id: 3, emoji: "🪥", name: "Brush Teeth" },
      { id: 4, emoji: "🚿", name: "Take a Bath" },
      { id: 5, emoji: "👕", name: "Get Dressed" },
      { id: 6, emoji: "🍳", name: "Eat Breakfast" },
    ],
  },
  {
    title: "Lunch Routine",
    activities: [
      { id: 1, emoji: "🧼", name: "Wash Hands" },
      { id: 2, emoji: "🍽️", name: "Set the Table" },
      { id: 3, emoji: "🍛", name: "Eat Lunch" },
      { id: 4, emoji: "🧹", name: "Clear the Table" },
      { id: 5, emoji: "🫧", name: "Wash Dishes" },
      { id: 6, emoji: "💧", name: "Drink Water" },
    ],
  },
  {
    title: "Bedtime Routine",
    activities: [
      { id: 1, emoji: "🍲", name: "Eat Dinner" },
      { id: 2, emoji: "🧹", name: "Clean Up" },
      { id: 3, emoji: "🛁", name: "Take a Bath" },
      { id: 4, emoji: "🩴", name: "Put on Pajamas" },
      { id: 5, emoji: "📖", name: "Read a Story" },
      { id: 6, emoji: "😴", name: "Go to Sleep" },
    ],
  },
  {
    title: "Shopping Routine",
    activities: [
      { id: 1, emoji: "📝", name: "Make a List" },
      { id: 2, emoji: "👛", name: "Grab Wallet" },
      { id: 3, emoji: "🚗", name: "Drive to Store" },
      { id: 4, emoji: "🛒", name: "Pick Items" },
      { id: 5, emoji: "💳", name: "Pay at Counter" },
      { id: 6, emoji: "🏠", name: "Go Home" },
    ],
  },
];

const DIFFICULTY_CONFIG = [
  { name: "Easy", itemCount: 3, routinesNeeded: 2 },
  { name: "Medium", itemCount: 4, routinesNeeded: 2 },
  { name: "Hard", itemCount: 5, routinesNeeded: 3 },
  { name: "Tough", itemCount: 6, routinesNeeded: 3 },
  { name: "Expert", itemCount: 6, routinesNeeded: 4 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DailyRoutinePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [difficulty, setDifficulty] = useState(0);
  const [level, setLevel] = useState(1);
  const { t } = useLanguage();
  const [routineIdx, setRoutineIdx] = useState(0);
  const [items, setItems] = useState(() => shuffle(ROUTINES[0].activities.slice(0, 3)));
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [routinesCompleted, setRoutinesCompleted] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const routine = ROUTINES[routineIdx % ROUTINES.length];
  const config = DIFFICULTY_CONFIG[difficulty];

  useEffect(() => {
    const stats = getGameStats(patientId, "daily_routine");
    setLevel(stats.currentLevel);
    setDifficulty(Math.min(stats.currentLevel - 1, 4));
  }, [patientId]);

  const moveUp = (idx: number) => {
    if (idx === 0 || submitted) return;
    if (soundEnabled) Sounds.buttonClick();
    const newItems = [...items];
    [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
    setItems(newItems);
  };

  const moveDown = (idx: number) => {
    if (idx === items.length - 1 || submitted) return;
    if (soundEnabled) Sounds.buttonClick();
    const newItems = [...items];
    [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
    setItems(newItems);
  };

  const checkOrder = () => {
    setSubmitted(true);
    const correct = routine.activities.slice(0, config.itemCount);
    const res = items.map((item, i) => item.id === correct[i].id);
    setResults(res);
    const correctCount = res.filter(Boolean).length;
    setScore((s) => s + correctCount);
    setTotalCorrect((tc) => tc + correctCount);
    setTotalAttempts((ta) => ta + config.itemCount);

    if (correctCount === config.itemCount) {
      if (soundEnabled) Sounds.correct();
    } else {
      if (soundEnabled) Sounds.wrong();
    }
  };

  const nextRoutine = () => {
    const newCompleted = routinesCompleted + 1;
    setRoutinesCompleted(newCompleted);
    
    if (newCompleted % config.routinesNeeded === 0 && difficulty < 4) {
      const newDiff = difficulty + 1;
      setDifficulty(newDiff);
      setLevel(newDiff + 1);
      setShowLevelUp(true);
      if (soundEnabled) Sounds.levelUp();
      
      updateGameStats(
        patientId,
        "daily_routine",
        totalCorrect + results.filter(Boolean).length,
        totalAttempts + config.itemCount,
        score
      );
    }
    
    const nextIdx = (routineIdx + 1) % ROUTINES.length;
    setRoutineIdx(nextIdx);
    setItems(shuffle(ROUTINES[nextIdx].activities.slice(0, config.itemCount)));
    setSubmitted(false);
    setResults([]);
  };

  const resetGame = () => {
    setRoutineIdx(0);
    setItems(shuffle(ROUTINES[0].activities.slice(0, config.itemCount)));
    setScore(0);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setRoutinesCompleted(0);
    setSubmitted(false);
    setResults([]);
    setShowLevelUp(false);
  };

  const allCorrect = results.length > 0 && results.every(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/patient/${patientId}`)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-gray-800">📋 Daily Routine</h1>
              <p className="text-xs text-gray-500">Put activities in the right order!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-500"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Restart
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Difficulty Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {DIFFICULTY_LEVELS.map((lvl, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDifficulty(idx);
                setItems(shuffle(ROUTINES[routineIdx % ROUTINES.length].activities.slice(0, DIFFICULTY_CONFIG[idx].itemCount)));
                setSubmitted(false);
                setResults([]);
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                difficulty === idx
                  ? "bg-purple-500 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              {lvl.name}
            </button>
          ))}
        </div>

        {/* Level & Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Star className="h-5 w-5 mx-auto text-purple-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">Level {difficulty + 1}</p>
              <p className="text-xs text-gray-500">{config.name} • {config.itemCount} items</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{score}/{totalAttempts}</p>
              <p className="text-xs text-gray-500">Total Correct</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto text-green-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{routinesCompleted}</p>
              <p className="text-xs text-gray-500">Routines Done</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Up */}
        {showLevelUp && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-pulse">
            <CardContent className="p-5 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">Level Up! Now at {DIFFICULTY_CONFIG[difficulty].name}!</h3>
              <p className="text-yellow-100 text-sm">{config.itemCount} items to arrange • {config.routinesNeeded} routines to level up</p>
              <Button onClick={() => setShowLevelUp(false)} className="mt-3 bg-white text-orange-600 font-bold" size="sm">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Title */}
        <Card className="mb-6 border-0 shadow-md bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-5 text-center">
            <h2 className="text-xl font-bold">📋 {routine.title}</h2>
            <p className="text-purple-100 text-sm mt-1">
              Use ↑↓ arrows to arrange {config.itemCount} activities in the correct order
            </p>
          </CardContent>
        </Card>

        {/* Activity List */}
        <div className="space-y-2 mb-6">
          {items.map((item, idx) => (
            <div
              key={`${routineIdx}-${item.id}`}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                submitted
                  ? results[idx]
                    ? "bg-green-50 border-2 border-green-300"
                    : "bg-red-50 border-2 border-red-300"
                  : "bg-white border-2 border-gray-100 hover:border-purple-200"
              }`}
            >
              <span className="text-xs font-bold text-gray-400 w-6 text-center">
                {idx + 1}
              </span>
              <span className="text-2xl">{item.emoji}</span>
              <span className="flex-1 font-medium text-gray-800">{item.name}</span>
              {submitted ? (
                results[idx] ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="flex items-center gap-1">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-xs text-red-500">
                      Should be #{routine.activities.findIndex((a) => a.id === item.id) + 1}
                    </span>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-purple-100 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4 text-purple-500" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === items.length - 1}
                    className="p-1 rounded hover:bg-purple-100 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4 text-purple-500" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Result Banner */}
        {submitted && (
          <Card
            className={`mb-6 border-0 ${
              allCorrect
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-orange-400 to-red-400"
            } text-white`}
          >
            <CardContent className="p-5 text-center">
              <div className="text-4xl mb-2">{allCorrect ? "🎉" : "💪"}</div>
              <h3 className="text-xl font-bold">
                {allCorrect ? "Perfect!" : "Good Try!"}
              </h3>
              <p className="text-white/80 text-sm">
                {results.filter(Boolean).length}/{config.itemCount} correct
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {!submitted ? (
          <Button
            onClick={checkOrder}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            ✅ Check My Order
          </Button>
        ) : (
          <Button
            onClick={nextRoutine}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            size="lg"
          >
            Next Routine →
          </Button>
        )}
      </main>
    </div>
  );
}
