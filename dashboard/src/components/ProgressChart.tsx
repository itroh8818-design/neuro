'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { CognitiveScore } from '@/lib/firebase';

interface ProgressChartProps {
  scores: CognitiveScore[];
  detailed?: boolean;
}

export function ProgressChart({ scores, detailed = false }: ProgressChartProps) {
  const chartData = useMemo(() => {
    // Group by date and average scores
    const byDate = new Map<string, CognitiveScore[]>();

    scores.forEach((score) => {
      const existing = byDate.get(score.date) || [];
      existing.push(score);
      byDate.set(score.date, existing);
    });

    return Array.from(byDate.entries())
      .map(([date, dayScores]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        memory: Math.round(dayScores.reduce((a, s) => a + s.memory, 0) / dayScores.length),
        attention: Math.round(dayScores.reduce((a, s) => a + s.attention, 0) / dayScores.length),
        pattern: Math.round(dayScores.reduce((a, s) => a + s.pattern, 0) / dayScores.length),
        routine: Math.round(dayScores.reduce((a, s) => a + s.routine, 0) / dayScores.length),
        overall: Math.round(dayScores.reduce((a, s) => a + s.overall, 0) / dayScores.length),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [scores]);

  if (scores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Cognitive Progress</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Cognitive Progress</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {detailed ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="memory" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3 }} name="Memory" />
              <Line type="monotone" dataKey="attention" stroke="#2196F3" strokeWidth={2} dot={{ r: 3 }} name="Attention" />
              <Line type="monotone" dataKey="pattern" stroke="#FF9800" strokeWidth={2} dot={{ r: 3 }} name="Pattern" />
              <Line type="monotone" dataKey="routine" stroke="#9C27B0" strokeWidth={2} dot={{ r: 3 }} name="Routine" />
              <Line type="monotone" dataKey="overall" stroke="#333" strokeWidth={2} dot={{ r: 4 }} name="Overall" strokeDasharray="5 5" />
            </LineChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="#2E7D32"
                fill="#E8F5E9"
                strokeWidth={2}
                name="Overall Score"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
