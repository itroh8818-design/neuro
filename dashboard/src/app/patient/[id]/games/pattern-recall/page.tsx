"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Star, Volume2, VolumeX } from "lucide-react";
import {
  Sounds,
  DIFFICULTY_LEVELS,
  updateGameStats,
  getGameStats,
} from "@/lib/game-utils";
import { useLanguage } from "@/lib/language-context";

const COLORS = [
  "bg-red-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-pink-400",
];

const DIFFICULTY_CONFIG = [
  { name: "Easy", colors: 3, baseLen: 3, maxLen: 5 },
  { name: "Medium", colors: 4, baseLen: 4, maxLen: 6 },
  { name: "Hard", colors: 5, baseLen: 5, maxLen: 7 },
  { name: "Tough", colors: 6, baseLen: 5, maxLen: 8 },
  { name: "Expert", colors: 6, baseLen: 6, maxLen: 10 },
];

export default function PatternRecallPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [difficulty, setDifficulty] = useState(0);
  const [level, setLevel] = useState(1);
  const { t } = useLanguage();
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [showPattern, setShowPattern] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [message, setMessage] = useState("Watch the pattern!");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  useEffect(() => {
    const stats = getGameStats(patientId, "pattern_recognition");
    setLevel(stats.currentLevel);
    setDifficulty(Math.min(stats.currentLevel - 1, 4));
  }, [patientId]);

  const config = DIFFICULTY_CONFIG[difficulty];

  const generatePattern = useCallback(
    (roundNum: number) => {
      const len = Math.min(config.baseLen + Math.floor(roundNum / 2), config.maxLen);
      const pat: number[] = [];
      for (let i = 0; i < len; i++) {
        pat.push(Math.floor(Math.random() * config.colors));
      }
      return pat;
    },
    [config]
  );

  const playPattern = useCallback(
    (pat: number[]) => {
      setShowPattern(true);
      setMessage("Watch the pattern! 👀");
      let i = 0;
      const interval = setInterval(() => {
        if (i < pat.length) {
          setHighlighted(pat[i]);
          if (soundEnabled) Sounds.sequenceHighlight(pat[i]);
          setTimeout(() => setHighlighted(null), 400);
          i++;
        } else {
          clearInterval(interval);
          setShowPattern(false);
          setMessage("Your turn! Tap the colors 🎨");
        }
      }, 600);
    },
    [soundEnabled]
  );

  const startGame = useCallback(() => {
    setScore(0);
    setRoundScore(0);
    setRoundsCompleted(0);
    setGameOver(false);
    setShowLevelUp(false);
    const pat = generatePattern(0);
    setPattern(pat);
    setPlayerInput([]);
    playPattern(pat);
  }, [generatePattern, playPattern]);

  useEffect(() => {
    startGame();
  }, [difficulty]);

  const handleTap = (idx: number) => {
    if (showPattern || isChecking || gameOver) return;

    if (soundEnabled) Sounds.buttonClick();
    setHighlighted(idx);
    setTimeout(() => setHighlighted(null), 200);

    const newInput = [...playerInput, idx];
    setPlayerInput(newInput);

    if (idx !== pattern[newInput.length - 1]) {
      setIsChecking(true);
      if (soundEnabled) Sounds.wrong();
      setMessage("Oops! That was wrong 😅");
      setTimeout(() => {
        setGameOver(true);
        const accuracy = Math.round(((newInput.length - 1) / pattern.length) * 100);
        const { levelUp } = updateGameStats(
          patientId,
          "pattern_recognition",
          newInput.length - 1,
          pattern.length,
          accuracy
        );
        if (levelUp) {
          setShowLevelUp(true);
          if (soundEnabled) Sounds.levelUp();
        }
      }, 1000);
      return;
    }

    if (newInput.length === pattern.length) {
      setIsChecking(true);
      const bonus = (difficulty + 1) * 10;
      setScore((s) => s + bonus);
      setRoundScore(bonus);
      setRoundsCompleted((r) => r + 1);
      setMessage(`Correct! +${bonus} points ⭐`);
      if (soundEnabled) Sounds.correct();

      setTimeout(() => {
        setLevel((l) => l + 1);
        const newPat = generatePattern(roundsCompleted + 1);
        setPattern(newPat);
        setPlayerInput([]);
        setIsChecking(false);
        playPattern(newPat);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-blue-100">
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
              <h1 className="font-bold text-gray-800">🎯 Pattern Recall</h1>
              <p className="text-xs text-gray-500">Remember the sequence!</p>
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
            <Button variant="outline" size="sm" onClick={startGame}>
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
              onClick={() => setDifficulty(idx)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                difficulty === idx
                  ? "bg-blue-500 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {lvl.name}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Star className="h-5 w-5 mx-auto text-purple-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">Level {level}</p>
              <p className="text-xs text-gray-500">{config.name}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{score}</p>
              <p className="text-xs text-gray-500">{t("score")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-gray-800">{pattern.length}</p>
              <p className="text-xs text-gray-500">Sequence</p>
              <p className="text-[10px] text-gray-400">{config.colors} colors</p>
            </CardContent>
          </Card>
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <Badge
            className={`text-base px-4 py-2 ${
              gameOver
                ? "bg-red-100 text-red-600"
                : showPattern
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {message}
          </Badge>
        </div>

        {/* Level Up */}
        {showLevelUp && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-pulse">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
              <p className="text-yellow-100">Sequence length: {pattern.length} | {config.colors} colors active!</p>
              <Button onClick={() => setShowLevelUp(false)} className="mt-4 bg-white text-orange-600 hover:bg-orange-50 font-bold">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Game Over */}
        {gameOver && (
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">🧠</div>
              <h2 className="text-2xl font-bold mb-2">Great Effort!</h2>
              <p className="text-blue-100 mb-1">
                You reached Level {level} on {config.name}!
              </p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <Badge className="bg-white/20 text-white border-0">
                  Score: {score}
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  Rounds: {roundsCompleted}
                </Badge>
              </div>
              <Button
                onClick={startGame}
                className="mt-4 bg-white text-blue-600 hover:bg-blue-50 font-bold"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Color Grid */}
        <div className="grid gap-4 max-w-sm mx-auto" style={{ gridTemplateColumns: `repeat(${Math.min(config.colors, 3)}, 1fr)` }}>
          {COLORS.slice(0, config.colors).map((color, idx) => (
            <button
              key={idx}
              onClick={() => handleTap(idx)}
              disabled={showPattern || isChecking || gameOver}
              className={`aspect-square rounded-3xl ${color} transition-all duration-200 shadow-lg ${
                highlighted === idx
                  ? "scale-110 brightness-125 ring-4 ring-white shadow-2xl"
                  : "hover:scale-105 active:scale-95"
              } ${gameOver ? "opacity-50" : ""}`}
            />
          ))}
        </div>

        {/* Pattern length indicator */}
        <div className="mt-6 flex items-center justify-center gap-1 flex-wrap">
          {pattern.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < playerInput.length
                  ? playerInput[i] === pattern[i]
                    ? "bg-green-400"
                    : "bg-red-400"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Pattern length: {pattern.length} • Colors: {config.colors} • Difficulty: {config.name}
        </p>
      </main>
    </div>
  );
}
