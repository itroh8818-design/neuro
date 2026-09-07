"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, Trophy, Clock, Zap, Star, Volume2, VolumeX } from "lucide-react";
import {
  Sounds,
  DIFFICULTY_LEVELS,
  updateGameStats,
  getGameStats,
  type DifficultyConfig,
} from "@/lib/game-utils";
import { useLanguage } from "@/lib/language-context";

const EMOJIS = ["🐶", "🐱", "🐸", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁", "🐯", "🐮", "🐷"];

interface CardType {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateBoard(pairs: number): CardType[] {
  const selected = shuffle(EMOJIS).slice(0, pairs);
  const deck = shuffle([...selected, ...selected].map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  })));
  return deck;
}

export default function MemoryMatchPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [level, setLevel] = useState(1);
  const [difficulty, setDifficulty] = useState<DifficultyConfig>(DIFFICULTY_LEVELS[0]);
  const [cards, setCards] = useState<CardType[]>(() => generateBoard(4));
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [animatingCards, setAnimatingCards] = useState<Set<number>>(new Set());
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const { t } = useLanguage();

  const totalPairs = difficulty.pairs || 4;

  // Load saved progress
  useEffect(() => {
    const stats = getGameStats(patientId, "memory_match");
    setLevel(stats.currentLevel);
    setDifficulty(DIFFICULTY_LEVELS[Math.min(stats.currentLevel - 1, 4)]);
  }, [patientId]);

  // Timer
  useEffect(() => {
    if (gameOver || matchedCount === totalPairs) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameOver, matchedCount]);

  // Check win
  useEffect(() => {
    if (matchedCount === totalPairs && moves > 0) {
      setGameOver(true);
      if (soundEnabled) Sounds.gameComplete();
      
      // Save stats
      const score = Math.max(0, 100 - (moves - totalPairs) * 3);
      const { levelUp } = updateGameStats(
        patientId,
        "memory_match",
        matchedCount,
        moves,
        score
      );
      if (levelUp) {
        setTimeout(() => {
          setShowLevelUp(true);
          if (soundEnabled) Sounds.levelUp();
        }, 1500);
      }
    }
  }, [matchedCount, totalPairs, moves, soundEnabled, patientId]);

  const handleFlip = useCallback(
    (id: number) => {
      if (isLocked) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return;

      if (soundEnabled) Sounds.cardFlip();
      
      // Add flip animation
      setAnimatingCards((prev) => new Set([...prev, id]));
      setTimeout(() => setAnimatingCards((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }), 300);

      const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
      const newFlipped = [...flippedIds, id];

      if (newFlipped.length === 1) {
        setCards(newCards);
        setFlippedIds(newFlipped);
      } else if (newFlipped.length === 2) {
        setCards(newCards);
        setFlippedIds(newFlipped);
        setMoves((m) => m + 1);
        setIsLocked(true);

        const [first, second] = newFlipped;
        const card1 = newCards.find((c) => c.id === first)!;
        const card2 = newCards.find((c) => c.id === second)!;

        if (card1.emoji === card2.emoji) {
          // Match found!
          setComboCount((c) => c + 1);
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 1000);
          
          setTimeout(() => {
            if (soundEnabled) Sounds.match();
            setCards((prev) =>
              prev.map((c) =>
                c.id === first || c.id === second ? { ...c, matched: true } : c
              )
            );
            setMatchedCount((mc) => mc + 1);
            setFlippedIds([]);
            setIsLocked(false);
          }, 500);
        } else {
          // No match
          setComboCount(0);
          setTimeout(() => {
            if (soundEnabled) Sounds.mismatch();
            setCards((prev) =>
              prev.map((c) =>
                c.id === first || c.id === second ? { ...c, flipped: false } : c
              )
            );
            setFlippedIds([]);
            setIsLocked(false);
          }, 800);
        }
      }
    },
    [cards, flippedIds, isLocked, soundEnabled]
  );

  const resetGame = () => {
    setCards(generateBoard(totalPairs));
    setFlippedIds([]);
    setMoves(0);
    setMatchedCount(0);
    setTimer(0);
    setGameOver(false);
    setIsLocked(false);
    setComboCount(0);
    setShowLevelUp(false);
  };

  const changeLevel = (newLevel: number) => {
    setLevel(newLevel);
    setDifficulty(DIFFICULTY_LEVELS[newLevel - 1]);
    resetGame();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const score = moves > 0 ? Math.max(0, 100 - (moves - totalPairs) * 3) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-green-100">
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
              <h1 className="font-bold text-gray-800">🃏 {t("memoryMatch")}</h1>
              <p className="text-xs text-gray-500">{t("matchPairs")}</p>
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
              {t("restart")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Level Selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {DIFFICULTY_LEVELS.map((d) => (
            <Button
              key={d.level}
              variant={level === d.level ? "default" : "outline"}
              size="sm"
              onClick={() => changeLevel(d.level)}
              className={`${
                level === d.level
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : ""
              }`}
            >
              <Star className="h-3 w-3 mr-1" />
              {d.name}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{formatTime(timer)}</p>
              <p className="text-xs text-gray-500">{t("time")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Zap className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{moves}</p>
              <p className="text-xs text-gray-500">{t("moves")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">
                {matchedCount}/{totalPairs}
              </p>
              <p className="text-xs text-gray-500">{t("matched")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Combo indicator */}
        {showCombo && comboCount >= 2 && (
          <div className="text-center mb-4 animate-bounce">
            <Badge className="bg-yellow-100 text-yellow-700 text-lg px-4 py-2">
              🔥 {comboCount}x Combo!
            </Badge>
          </div>
        )}

        {/* Level Up Modal */}
        {showLevelUp && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-pulse">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">{t("levelUp")}</h2>
              <p className="text-yellow-100">
                You&apos;ve unlocked <span className="font-bold">{DIFFICULTY_LEVELS[level]?.name}</span> difficulty!
              </p>
              <Button
                onClick={() => {
                  setShowLevelUp(false);
                  changeLevel(level);
                }}
                className="mt-4 bg-white text-orange-600 hover:bg-orange-50 font-bold"
              >
                {t("continueBtn2")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Game Over */}
        {gameOver && (
          <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-green-100 mb-1">You matched all pairs!</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <Badge className="bg-white/20 text-white border-0">
                  Score: {score}%
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  Time: {formatTime(timer)}
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  Moves: {moves}
                </Badge>
              </div>
              <Button
                onClick={resetGame}
                className="mt-4 bg-white text-emerald-600 hover:bg-green-50 font-bold"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("playAgain")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cards Grid */}
        <div className={`grid gap-3 ${totalPairs <= 4 ? "grid-cols-4" : totalPairs <= 6 ? "grid-cols-4" : "grid-cols-4"}`}>
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              disabled={card.matched || isLocked}
              className={`aspect-square rounded-2xl text-3xl font-bold transition-all duration-300 flex items-center justify-center shadow-md
                ${
                  card.flipped || card.matched
                    ? card.matched
                      ? "bg-green-100 border-2 border-green-300 scale-95 opacity-80"
                      : "bg-white border-2 border-purple-300 scale-105"
                    : "bg-gradient-to-br from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 hover:scale-105 cursor-pointer active:scale-95"
                }
                ${animatingCards.has(card.id) ? "animate-spin" : ""}
              `}
            >
              {card.flipped || card.matched ? (
                <span className={card.matched ? "grayscale-[30%]" : ""}>
                  {card.emoji}
                </span>
              ) : (
                <span className="text-white text-2xl">?</span>
              )}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((matchedCount / totalPairs) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(matchedCount / totalPairs) * 100}%` }}
            />
          </div>
        </div>

        {/* Difficulty Info */}
        <Card className="mt-6 border-0 shadow-sm bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Current Level: <span className={difficulty.color}>{difficulty.name}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {difficulty.pairs} pairs to match • Get 80%+ accuracy to level up!
                </p>
              </div>
              <Badge className={difficulty.color}>Level {level}</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
