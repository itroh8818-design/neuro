"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Timer, Volume2, VolumeX, Star } from "lucide-react";
import {
  Sounds,
  DIFFICULTY_LEVELS,
  updateGameStats,
  getGameStats,
} from "@/lib/game-utils";
import { useLanguage } from "@/lib/language-context";

const OBJECT_SETS = [
  { prompt: "Which one is a fruit? 🍎", options: ["🍎", "🚗", "📱"], answer: 0 },
  { prompt: "Which one is used for writing? ✏️", options: ["⚽", "✏️", "🎸"], answer: 1 },
  { prompt: "Which one keeps you warm? 🧣", options: ["🪟", "🧣", "📎"], answer: 1 },
  { prompt: "Which one do you drink from? 🥛", options: ["🛏️", "🪑", "🥛"], answer: 2 },
  { prompt: "Which one do you wear on your feet? 👟", options: ["👟", "🧢", "🧤"], answer: 0 },
  { prompt: "Which one do you use to listen to music? 🎧", options: ["🔪", "🎧", "🧲"], answer: 1 },
  { prompt: "Which one is an animal? 🐘", options: ["🚗", "🌳", "🐘"], answer: 2 },
  { prompt: "Which one do you sit on? 🪑", options: ["🪑", "👟", "🍎"], answer: 0 },
  { prompt: "Which one gives light? 💡", options: ["🧦", "💡", "🧲"], answer: 1 },
  { prompt: "Which one is a flower? 🌸", options: ["🪨", "🌸", "🧃"], answer: 1 },
  { prompt: "Which one do you cook with? 🍳", options: ["🍳", "📚", "🛏️"], answer: 0 },
  { prompt: "Which one keeps time? ⏰", options: ["🎈", "⏰", "🔑"], answer: 1 },
];

const DIFFICULTY_CONFIG = [
  { name: "Easy", questions: 5, options: 3, timeLimit: 0 },
  { name: "Medium", questions: 6, options: 3, timeLimit: 0 },
  { name: "Hard", questions: 8, options: 4, timeLimit: 0 },
  { name: "Tough", questions: 10, options: 4, timeLimit: 15 },
  { name: "Expert", questions: 12, options: 4, timeLimit: 10 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ObjectRecognitionPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [difficulty, setDifficulty] = useState(0);
  const [level, setLevel] = useState(1);
  const { t } = useLanguage();
  const [questions, setQuestions] = useState(() => shuffle(OBJECT_SETS).slice(0, 5));
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const config = DIFFICULTY_CONFIG[difficulty];

  useEffect(() => {
    const stats = getGameStats(patientId, "object_recognition");
    setLevel(stats.currentLevel);
    setDifficulty(Math.min(stats.currentLevel - 1, 4));
  }, [patientId]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[currentQ].answer;
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      if (soundEnabled) Sounds.correct();
    } else {
      if (soundEnabled) Sounds.wrong();
    }

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ((c) => c + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        setGameOver(true);
        const finalScore = correct ? score + 1 : score;
        const { levelUp } = updateGameStats(
          patientId,
          "object_recognition",
          finalScore,
          questions.length,
          Math.round((finalScore / questions.length) * 100)
        );
        if (levelUp) {
          setShowLevelUp(true);
          if (soundEnabled) Sounds.levelUp();
        }
      }
    }, 1000);
  };

  const restart = () => {
    setQuestions(shuffle(OBJECT_SETS).slice(0, config.questions));
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setTimer(0);
    setGameOver(false);
    setShowLevelUp(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/patient/${patientId}`)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-gray-800">🔍 Object ID</h1>
              <p className="text-xs text-gray-500">Identify everyday objects!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-500">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={restart}>
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
                setQuestions(shuffle(OBJECT_SETS).slice(0, DIFFICULTY_CONFIG[idx].questions));
                setCurrentQ(0);
                setScore(0);
                setSelected(null);
                setIsCorrect(null);
                setTimer(0);
                setGameOver(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                difficulty === idx
                  ? "bg-orange-500 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {lvl.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Star className="h-5 w-5 mx-auto text-purple-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">Level {difficulty + 1}</p>
              <p className="text-xs text-gray-500">{config.name}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{score}/{questions.length}</p>
              <p className="text-xs text-gray-500">{t("score")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Timer className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{formatTime(timer)}</p>
              <p className="text-xs text-gray-500">Time{config.timeLimit > 0 ? ` (${config.timeLimit}s/q)` : ""}</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-orange-400 h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Level Up */}
        {showLevelUp && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-pulse">
            <CardContent className="p-5 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">Level Up! Now at {config.name}!</h3>
              <p className="text-yellow-100 text-sm">{config.questions} questions • {config.options} options{config.timeLimit > 0 ? ` • ${config.timeLimit}s per question` : ""}</p>
              <Button onClick={() => setShowLevelUp(false)} className="mt-3 bg-white text-orange-600 font-bold" size="sm">Continue</Button>
            </CardContent>
          </Card>
        )}

        {gameOver ? (
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-3">🏆</div>
              <h2 className="text-2xl font-bold mb-2">Game Complete!</h2>
              <p className="text-orange-100">You identified {score} out of {questions.length} correctly!</p>
              <div className="flex justify-center gap-4 mt-4">
                <Badge className="bg-white/20 text-white border-0">Accuracy: {accuracy}%</Badge>
                <Badge className="bg-white/20 text-white border-0">Time: {formatTime(timer)}</Badge>
                <Badge className="bg-white/20 text-white border-0">{config.name}</Badge>
              </div>
              <Button onClick={restart} className="mt-6 bg-white text-orange-600 hover:bg-orange-50 font-bold">
                <RotateCcw className="h-4 w-4 mr-2" /> Play Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-8 text-center">
                <p className="text-xl font-bold text-gray-800 mb-6">{questions[currentQ].prompt}</p>
                <div className="grid grid-cols-3 gap-4">
                  {questions[currentQ].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                      className={`text-5xl p-6 rounded-2xl border-3 transition-all duration-200 ${
                        selected === idx
                          ? isCorrect
                            ? "bg-green-100 border-green-400 scale-110"
                            : "bg-red-100 border-red-400 scale-110"
                          : selected !== null && idx === questions[currentQ].answer
                          ? "bg-green-50 border-green-300"
                          : "bg-gray-50 border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:scale-105"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {isCorrect !== null && (
                  <p className={`mt-4 text-lg font-bold ${isCorrect ? "text-green-600" : "text-red-500"}`}>
                    {isCorrect ? "✅ Correct!" : "❌ Try again next time!"}
                  </p>
                )}
              </CardContent>
            </Card>
            <p className="text-center text-sm text-gray-400">
              Question {currentQ + 1} of {questions.length} • {config.name}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
