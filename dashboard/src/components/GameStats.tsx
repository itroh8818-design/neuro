'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { GameSession } from '@/lib/firebase';

interface GameStatsProps {
  sessions: GameSession[];
  detailed?: boolean;
}

const GAME_NAMES: Record<string, string> = {
  memory_match: 'Memory Match',
  pattern_recognition: 'Pattern',
  daily_routine: 'Daily Routine',
  object_recognition: 'Object Rec',
  attention_focus: 'Attention',
  emotional_engagement: 'Emotional',
};

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#E91E63'];

export function GameStats({ sessions, detailed = false }: GameStatsProps) {
  const gameBreakdown = useMemo(() => {
    const breakdown = new Map<string, { count: number; totalAccuracy: number; totalScore: number }>();

    sessions.forEach((session) => {
      const existing = breakdown.get(session.gameType) || { count: 0, totalAccuracy: 0, totalScore: 0 };
      existing.count += 1;
      existing.totalAccuracy += session.accuracy;
      existing.totalScore += session.score;
      breakdown.set(session.gameType, existing);
    });

    return Array.from(breakdown.entries()).map(([gameType, data]) => ({
      name: GAME_NAMES[gameType] || gameType,
      games: data.count,
      avgAccuracy: Math.round(data.totalAccuracy / data.count),
      totalScore: data.totalScore,
    }));
  }, [sessions]);

  const difficultyDistribution = useMemo(() => {
    const dist = { easy: 0, medium: 0, hard: 0 };
    sessions.forEach((s) => {
      dist[s.difficulty as keyof typeof dist] += 1;
    });
    return [
      { name: 'Easy', value: dist.easy, color: '#4CAF50' },
      { name: 'Medium', value: dist.medium, color: '#FF9800' },
      { name: 'Hard', value: dist.hard, color: '#F44336' },
    ].filter(d => d.value > 0);
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎮 Game Statistics</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No game sessions yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🎮 Game Statistics</h3>

      {/* Bar Chart */}
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={gameBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="games" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Sessions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-game accuracy table */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">Average Accuracy by Game</p>
        {gameBreakdown.map((game, index) => (
          <div key={game.name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-700 flex-1">{game.name}</span>
            <div className="w-32 bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${game.avgAccuracy}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 w-10 text-right">
              {game.avgAccuracy}%
            </span>
          </div>
        ))}
      </div>

      {/* Difficulty Distribution */}
      {detailed && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-3">Difficulty Distribution</p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {difficultyDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}: {d.value} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
