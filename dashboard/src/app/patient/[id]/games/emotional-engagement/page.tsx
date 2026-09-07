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

const EMOTIONS = [
  { emoji: "😊", label: "Happy", description: "Feeling joyful and content" },
  { emoji: "😢", label: "Sad", description: "Feeling down or unhappy" },
  { emoji: "😠", label: "Angry", description: "Feeling upset or frustrated" },
  { emoji: "😨", label: "Scared", description: "Feeling afraid or worried" },
  { emoji: "😲", label: "Surprised", description: "Something unexpected happened" },
  { emoji: "🤢", label: "Disgusted", description: "Something gross or unpleasant" },
  { emoji: "😴", label: "Tired", description: "Need rest or sleep" },
  { emoji: "🥰", label: "Loved", description: "Feeling cherished and warm" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Question {
  scenario: string;
  correctEmotion: number;
  options: number[];
}

const SCENARIOS: { scenario: string; emotionIdx: number }[] = [
  { scenario: "You got a nice gift from a friend 🎁", emotionIdx: 0 },
  { scenario: "Your favorite toy broke 💔", emotionIdx: 1 },
  { scenario: "Someone took your dessert without asking 🍰", emotionIdx: 2 },
  { scenario: "You heard a loud noise at night 🌙", emotionIdx: 3 },
  { scenario: "Your friend planned a surprise party 🎉", emotionIdx: 4 },
  { scenario: "You saw a spider on your food 🕷️", emotionIdx: 5 },
  { scenario: "You stayed up very late last night 🌛", emotionIdx: 6 },
  { scenario: "Your family said 'I love you' 💕", emotionIdx: 7 },
  { scenario: "You won a game you were playing 🏆", emotionIdx: 0 },
  { scenario: "Your pet ran away from home 🐕", emotionIdx: 1 },
  { scenario: "Someone pushed you in the playground 😤", emotionIdx: 2 },
  { scenario: "A dog started barking loudly at you 🐕‍🦺", emotionIdx: 3 },
  { scenario: "You found money on the ground! 💰", emotionIdx: 0 },
  { scenario: "Your friend shared their lunch with you 🍕", emotionIdx: 7 },
  { scenario: "You got a bad grade on a test 📝", emotionIdx: 1 },
  { scenario: "Someone jumped out to scare you 👻", emotionIdx: 3 },
  { scenario: "You saw something really cool! ✨", emotionIdx: 4 },
  { scenario: "You ate something that tasted bad 🤮", emotionIdx: 5 },
];

const DIFFICULTY_CONFIG = [
  { name: "Easy", questions: 5, options: 3, allEmotions: false },
  { name: "Medium", questions: 6, options: 3, allEmotions: false },
  { name: "Hard", questions: 8, options: 4, allEmotions: false },
  { name: "Tough", questions: 10, options: 4, allEmotions: true },
  { name: "Expert", questions: 12, options: 4, allEmotions: true },
];

function generateQuestions(count: number, optionCount: number): Question[] {
  const shuffled = shuffle(SCENARIOS).slice(0, count);
  return shuffled.map((s) => {
    const wrongIndices = EMOTIONS.map((_, i) => i)
      .filter((i) => i !== s.emotionIdx)
      .sort(() => Math.random() - 0.5)
      .slice(0, optionCount - 1);
    const options = shuffle([s.emotionIdx, ...wrongIndices]);
    return { scenario: s.scenario, correctEmotion: s.emotionIdx, options };
  });
}

export default function EmotionalEngagementPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [difficulty, setDifficulty] = useState(0);
  const [level, setLevel] = useState(1);
  const { t } = useLanguage();
  const [questions, setQuestions] = useState(() => generateQuestions(5, 3));
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const config = DIFFICULTY_CONFIG[difficulty];

  useEffect(() => {
    const stats = getGameStats(patientId, "emotional_engagement");
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
    const correct = idx === questions[currentQ].correctEmotion;
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      if (soundEnabled) Sounds.correct();
    } else {
      setStreak(0);
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
          "emotional_engagement",
          finalScore,
          questions.length,
          Math.round((finalScore / questions.length) * 100)
        );
        if (levelUp) {
          setShowLevelUp(true);
          if (soundEnabled) Sounds.levelUp();
        }
      }
    }, 1200);
  };

  const restart = () => {
    setQuestions(generateQuestions(config.questions, config.options));
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setTimer(0);
    setGameOver(false);
    setStreak(0);
    setShowLevelUp(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-yellow-100">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/patient/${patientId}`)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-gray-800">😊 Emotion Match</h1>
              <p className="text-xs text-gray-500">Match feelings to situations!</p>
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
                setQuestions(generateQuestions(DIFFICULTY_CONFIG[idx].questions, DIFFICULTY_CONFIG[idx].options));
                setCurrentQ(0);
                setScore(0);
                setSelected(null);
                setIsCorrect(null);
                setTimer(0);
                setGameOver(false);
                setStreak(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                difficulty === idx
                  ? "bg-yellow-500 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50"
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
              <Badge className={`text-sm ${streak >= 3 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
                🔥 {streak}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Level Up */}
        {showLevelUp && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-pulse">
            <CardContent className="p-5 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">Level Up! Now at {config.name}!</h3>
              <p className="text-yellow-100 text-sm">{config.questions} questions • {config.options} emotion choices</p>
              <Button onClick={() => setShowLevelUp(false)} className="mt-3 bg-white text-orange-600 font-bold" size="sm">Continue</Button>
            </CardContent>
          </Card>
        )}

        {gameOver ? (
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-3">🌟</div>
              <h2 className="text-2xl font-bold mb-2">Wonderful Job!</h2>
              <p className="text-yellow-100">You matched {score} out of {questions.length} emotions correctly!</p>
              <div className="flex justify-center gap-4 mt-4">
                <Badge className="bg-white/20 text-white border-0">Accuracy: {accuracy}%</Badge>
                <Badge className="bg-white/20 text-white border-0">Time: {formatTime(timer)}</Badge>
                <Badge className="bg-white/20 text-white border-0">{config.name}</Badge>
              </div>
              <p className="text-yellow-100 text-sm mt-3 italic">
                &ldquo;Understanding emotions helps us connect with others better.&rdquo;
              </p>
              <Button onClick={restart} className="mt-6 bg-white text-orange-600 hover:bg-orange-50 font-bold">
                <RotateCcw className="h-4 w-4 mr-2" /> Play Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 mb-2">How would you feel?</p>
                  <p className="text-xl font-bold text-gray-800">{questions[currentQ].scenario}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {questions[currentQ].options.map((emotionIdx) => {
                    const emotion = EMOTIONS[emotionIdx];
                    return (
                      <button
                        key={emotionIdx}
                        onClick={() => handleAnswer(emotionIdx)}
                        disabled={selected !== null}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                          selected === emotionIdx
                            ? isCorrect
                              ? "bg-green-50 border-green-400 scale-105"
                              : "bg-red-50 border-red-400 scale-105"
                            : selected !== null && emotionIdx === questions[currentQ].correctEmotion
                            ? "bg-green-50 border-green-300"
                            : "bg-white border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 hover:scale-102"
                        }`}
                      >
                        <span className="text-4xl block mb-2">{emotion.emoji}</span>
                        <span className="font-bold text-gray-800 block">{emotion.label}</span>
                        <span className="text-xs text-gray-500 block">{emotion.description}</span>
                      </button>
                    );
                  })}
                </div>

                {isCorrect !== null && (
                  <div className={`mt-4 p-3 rounded-xl text-center ${isCorrect ? "bg-green-50" : "bg-orange-50"}`}>
                    <p className={`font-bold ${isCorrect ? "text-green-600" : "text-orange-600"}`}>
                      {isCorrect ? "✅ That's right! Great emotional awareness!" : "💡 Not quite! It's okay to learn!"}
                    </p>
                  </div>
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
