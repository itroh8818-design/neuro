'use client';

import { GameSession } from '@/lib/firebase';

interface ActivityTimelineProps {
  sessions: GameSession[];
}

const GAME_ICONS: Record<string, string> = {
  memory_match: '🧠',
  pattern_recognition: '🔍',
  daily_routine: '📅',
  object_recognition: '👁️',
  attention_focus: '🎯',
  emotional_engagement: '❤️',
};

const GAME_NAMES: Record<string, string> = {
  memory_match: 'Memory Match',
  pattern_recognition: 'Pattern Recognition',
  daily_routine: 'Daily Routine',
  object_recognition: 'Object Recognition',
  attention_focus: 'Attention & Focus',
  emotional_engagement: 'Emotional Engagement',
};

export function ActivityTimeline({ sessions }: ActivityTimelineProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Recent Activity</h3>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <span className="text-3xl">📭</span>
          <p className="mt-2">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-2xl">
                {GAME_ICONS[session.gameType] || '🎮'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {GAME_NAMES[session.gameType] || session.gameType}
                </p>
                <p className="text-xs text-gray-500">
                  {session.difficulty} • Score: {session.score}/{session.maxScore}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${
                  session.accuracy >= 70 ? 'text-green-600' :
                  session.accuracy >= 40 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {Math.round(session.accuracy)}%
                </p>
                <p className="text-xs text-gray-400">
                  {formatDuration(session.durationMs)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
