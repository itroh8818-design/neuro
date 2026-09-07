"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Zap, Timer, Volume2, VolumeX, Star } from "lucide-react";
import {
  Sounds,
  DIFFICULTY_LEVELS,
  updateGameStats,
  getGameStats,
} from "@/lib/game-utils";
import { useLanguage } from "@/lib/language-context";

const DIFFICULTY_CONFIG = [
  { name: "Easy", gridSize: 3, cellsStart: 2, cellsEnd: 3, rounds: 6 },
  { name: "Medium", gridSize: 3, cellsStart: 3, cellsEnd: 4, rounds: 7 },
  { name: "Hard", gridSize: 4, cellsStart: 3, cellsEnd: 5, rounds: 8 },
  { name: "Tough", gridSize: 4, cellsStart: 4, cellsEnd: 6, rounds: 9 },
  { name: "Expert", gridSize: 5, cellsStart: 5, cellsEnd: 8, rounds: 10 },
];

export default function FocusTestPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [difficulty, setDifficulty] = useState(0);
  const [level, setLevel] = useState(1);
  const { t } = useLanguage();
  const [gridSize, setGridSize] = useState(3);
  const [highlightCells, setHighlightCells] = useState<number[]>([]);
  const [playerCells, setPlayerCells] = useState<number[]>([]);
  const [showPhase, setShowPhase] = useState(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [roundNum, setRoundNum] = useState(0);
  const [message, setMessage] = useState("Watch carefully! 👀");
  const [timer, setTimer] = useState(0);
  const [selectedThisRound, setSelectedThisRound] = useState<Set<number>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const config = DIFFICULTY_CONFIG[difficulty];

  useEffect(() => {
    const stats = getGameStats(patientId, "attention_focus");
    setLevel(stats.currentLevel);
    setDifficulty(Math.min(stats.currentLevel - 1, 4));
  }, [patientId]);

  const getCellsForRound = (roundIdx: number) => {
    const progress = roundIdx / Math.max(config.rounds - 1, 1);
    return Math.min(
      Math.round(config.cellsStart + progress * (config.cellsEnd - config.cellsStart)),
      config.cellsEnd
    );
  };

  const generateCells = useCallback((size: number, count: number) => {
    const allCells = Array.from({ length: size * size }, (_, i) => i);
    const shuffled = allCells.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  const startRound = useCallback(
    (roundIdx: number) => {
      setGridSize(config.gridSize);
      const count = getCellsForRound(roundIdx);
      const cells = generateCells(config.gridSize, count);
      setHighlightCells(cells);
      setPlayerCells([]);
      setSelectedThisRound(new Set());
      setShowPhase(true);
      setMessage(`Watch carefully! 👀 (${count} cells)`);

      setTimeout(() => {
        setShowPhase(false);
        setMessage(`Your turn! Find ${count} cells! 🎯`);
      }, count * 500 + 1000);
    },
    [config, generateCells]
  );

  const startGame = useCallback(() => {
    setRoundNum(0);
    setScore(0);
    setGameOver(false);
    setTimer(0);
    setShowLevelUp(false);
    startRound(0);
  }, [startRound]);

  useEffect(() => {
    startGame();
  }, [difficulty]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  const handleCellClick = (cellIdx: number) => {
    if (showPhase || gameOver || selectedThisRound.has(cellIdx)) return;

    if (soundEnabled) Sounds.buttonClick();
    const newSelected = new Set(selectedThisRound);
    newSelected.add(cellIdx);
    setSelectedThisRound(newSelected);
    setPlayerCells([...newSelected]);

    const isCorrect = highlightCells.includes(cellIdx);
    if (!isCorrect) {
      if (soundEnabled) Sounds.wrong();
      setMessage("Oops! That wasn't it! 😅");
      setTimeout(() => {
        setGameOver(true);
        const { levelUp } = updateGameStats(
          patientId,
          "attention_focus",
          score,
          config.rounds * 10,
          score
        );
        if (levelUp) {
          setShowLevelUp(true);
          if (soundEnabled) Sounds.levelUp();
        }
      }, 800);
      return;
    }

    if (soundEnabled) Sounds.correct();

    if (newSelected.size === highlightCells.length) {
      const bonus = (config.gridSize * highlightCells.length) * 2;
      setScore((s) => s + bonus);
      setMessage(`Great memory! +${bonus} points ⭐`);

      setTimeout(() => {
        if (roundNum + 1 >= config.rounds) {
          setGameOver(true);
          const { levelUp } = updateGameStats(
            patientId,
            "attention_focus",
            score + bonus,
            config.rounds * 10,
            score + bonus
          );
          if (levelUp) {
            setShowLevelUp(true);
            if (soundEnabled) Sounds.levelUp();
          }
        } else {
          const nextRound = roundNum + 1;
          setRoundNum(nextRound);
          startRound(nextRound);
        }
      }, 1200);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/patient/${patientId}`)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-gray-800">🧩 Focus Test</h1>
              <p className="text-xs text-gray-500">Remember which cells were highlighted!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-500">
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
                  ? "bg-pink-500 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:bg-pink-50"
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
              <Zap className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">Round {roundNum + 1}/{config.rounds}</p>
              <p className="text-xs text-gray-500">Grid: {config.gridSize}×{config.gridSize}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{score}</p>
              <p className="text-xs text-gray-500">{t("score")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-6">
          <Badge className={`text-base px-4 py-2 ${showPhase ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {message}
          </Badge>
        </div>

        {/* Level Up */}
        {showLevelUp && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-pulse">
            <CardContent className="p-5 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">Level Up! Now at {config.name}!</h3>
              <p className="text-yellow-100 text-sm">{config.gridSize}×{config.gridSize} grid • {config.cellsStart}-{config.cellsEnd} cells to find</p>
              <Button onClick={() => setShowLevelUp(false)} className="mt-3 bg-white text-orange-600 font-bold" size="sm">Continue</Button>
            </CardContent>
          </Card>
        )}

        {gameOver ? (
          <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-3">🎯</div>
              <h2 className="text-2xl font-bold mb-2">Focus Complete!</h2>
              <p className="text-pink-100">You completed {roundNum} rounds on {config.name}!</p>
              <div className="flex justify-center gap-4 mt-4">
                <Badge className="bg-white/20 text-white border-0">Score: {score}</Badge>
                <Badge className="bg-white/20 text-white border-0">Time: {formatTime(timer)}</Badge>
                <Badge className="bg-white/20 text-white border-0">{config.name}</Badge>
              </div>
              <Button onClick={startGame} className="mt-6 bg-white text-pink-600 hover:bg-pink-50 font-bold">
                <RotateCcw className="h-4 w-4 mr-2" /> Play Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-sm mx-auto">
            <p className="text-center text-sm text-gray-500 mb-2">
              Grid: {config.gridSize}×{config.gridSize} | Find: {highlightCells.length} cells | {config.name}
            </p>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${config.gridSize}, 1fr)` }}>
              {Array.from({ length: config.gridSize * config.gridSize }, (_, cellIdx) => {
                const isHighlighted = highlightCells.includes(cellIdx);
                const isSelected = selectedThisRound.has(cellIdx);
                return (
                  <button
                    key={cellIdx}
                    onClick={() => handleCellClick(cellIdx)}
                    className={`aspect-square rounded-xl text-lg font-bold transition-all duration-200 ${
                      showPhase && isHighlighted
                        ? "bg-gradient-to-br from-red-400 to-pink-400 shadow-lg scale-105"
                        : isSelected
                        ? "bg-green-300 border-2 border-green-400"
                        : "bg-gray-100 hover:bg-gray-200 hover:scale-105 active:scale-95"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
