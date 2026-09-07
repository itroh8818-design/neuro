"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";import {
  ArrowLeft, 
  Gamepad2, 
  Brain, 
  Target, 
  ClipboardList, 
  Search, 
  Puzzle, 
  Smile,
  Trophy,
  Flame,
  Clock,
  Heart,
  Bell,
  BellRing,
  Calendar,
  Pill,
  CheckCircle2,
  Star,
} from "lucide-react";
import {
  getAllGameStats,
  getAccuracy,
  getOverallScore,
  getTotalGamesPlayed,
  formatTimeAgo,
  DIFFICULTY_LEVELS,
  type AllGameStats,
} from "@/lib/game-utils";
import { useLanguage } from "@/lib/language-context";
import VoiceAssistant from "@/components/VoiceAssistant";
import Chatbot from "@/components/Chatbot";

const PATIENTS = {
  patient_1: { name: "Kamala Devi", age: 72, streak: 7, score: 72 },
  patient_2: { name: "Ramesh Kalita", age: 68, streak: 3, score: 58 },
  patient_3: { name: "Priya Boro", age: 75, streak: 12, score: 81 },
};

const GAME_ROUTES: Record<string, string> = {
  memory_match: "games/memory-match",
  pattern_recognition: "games/pattern-recall",
  daily_routine: "games/daily-routine",
  object_recognition: "games/object-recognition",
  attention_focus: "games/attention-focus",
  emotional_engagement: "games/emotional-engagement",
};

const REMINDERS = [
  { id: 1, titleKey: "takeMedication", time: "8:00 AM", icon: "💊", recurring: true },
  { id: 2, titleKey: "morningWalk", time: "7:30 AM", icon: "🚶", recurring: true },
  { id: 3, titleKey: "drinkWater", timeKey: "every2Hours", icon: "💧", recurring: true },
  { id: 4, titleKey: "brainTrainingGame", time: "10:00 AM", icon: "🧠", recurring: true },
  { id: 5, titleKey: "eveningMedication", time: "6:00 PM", icon: "💊", recurring: true },
  { id: 6, titleKey: "doctorAppointment", timeKey: "tomorrow11am", icon: "🏥", recurring: false },
];

const GAMES = [
  {
    id: "memory_match",
    nameKey: "memoryMatch",
    descKey: "memoryMatchDesc",
    icon: "🃏",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "pattern_recognition",
    nameKey: "patternRecall",
    descKey: "patternRecallDesc",
    icon: "🎯",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: "daily_routine",
    nameKey: "dailyRoutine",
    descKey: "dailyRoutineDesc",
    icon: "📋",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "object_recognition",
    nameKey: "objectId",
    descKey: "objectIdDesc",
    icon: "🔍",
    color: "from-orange-400 to-red-500",
  },
  {
    id: "attention_focus",
    nameKey: "focusTest",
    descKey: "focusTestDesc",
    icon: "🧩",
    color: "from-pink-400 to-rose-500",
  },
  {
    id: "emotional_engagement",
    nameKey: "emotionMatch",
    descKey: "emotionMatchDesc",
    icon: "😊",
    color: "from-yellow-400 to-amber-500",
  },
];

const ACTIVITIES = [
  { id: 1, nameKey: "morningMeditation", time: "7:00 AM", icon: "🧘", completed: true },
  { id: 2, nameKey: "lightExercise", time: "8:00 AM", icon: "🚶", completed: true },
  { id: 3, nameKey: "brainTraining", time: "10:00 AM", icon: "🧠", completed: false },
  { id: 4, nameKey: "musicTherapy", time: "2:00 PM", icon: "🎵", completed: false },
  { id: 5, nameKey: "eveningWalk", time: "5:00 PM", icon: "🌅", completed: false },
];

export default function PatientDashboard() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const patient = PATIENTS[patientId as keyof typeof PATIENTS] || PATIENTS.patient_1;
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<AllGameStats | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const stats = getAllGameStats(patientId);
    setGameStats(stats);
  }, [patientId]);

  const overallScore = gameStats ? getOverallScore(gameStats) : 0;
  const totalGames = gameStats ? getTotalGamesPlayed(gameStats) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-lg">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-bold text-gray-800">{patient.name}</h1>
                <p className="text-xs text-gray-500">{t("welcomeBack")} 🌟</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-bold text-orange-600">{patient.streak}</span>
              <span className="text-xs text-orange-500">{t("dayStreak")}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Welcome Banner */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Hello, {patient.name.split(" ")[0]}! 👋</h2>
                <p className="text-purple-100">
                  {t("readyToTrain")} {t("dayStreak")}!
                </p>
              </div>
              <div className="text-6xl">🧠</div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{overallScore || patient.score}%</p>
              <p className="text-xs text-gray-500">{t("overallScore")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{totalGames || 0}</p>
              <p className="text-xs text-gray-500">{t("gamesPlayedLabel")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">2.5h</p>
              <p className="text-xs text-gray-500">{t("today")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Games Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-purple-500" />
                {t("yourGames")}
              </h2>
              <Badge className="bg-purple-100 text-purple-600">6 {t("available")}</Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {GAMES.map((game) => (
                <Card
                  key={game.id}
                  className={`border-0 shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                    selectedGame === game.id ? "ring-2 ring-purple-500" : ""
                  }`}
                  onClick={() => setSelectedGame(game.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-md`}>
                        {game.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">{t(game.nameKey)}</h3>
                          {gameStats && (
                            <Badge className={`text-xs ${DIFFICULTY_LEVELS[Math.min((gameStats[game.id as keyof AllGameStats]?.currentLevel || 1) - 1, 4)].color}`}>
                              <Star className="h-3 w-3 mr-0.5" />
                              {DIFFICULTY_LEVELS[Math.min((gameStats[game.id as keyof AllGameStats]?.currentLevel || 1) - 1, 4)].name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{t(game.descKey)}</p>
                        {gameStats ? (
                          <div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1 text-sm">
                                <Trophy className="h-3 w-3 text-yellow-500" />
                                <span className="font-medium text-gray-700">{getAccuracy(gameStats[game.id as keyof AllGameStats])}%</span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(gameStats[game.id as keyof AllGameStats].lastPlayed)}
                              </span>
                            </div>
                            <Progress value={getAccuracy(gameStats[game.id as keyof AllGameStats])} className="mt-2 h-1.5" />
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-3">{t("playGames")}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Play Button */}
            {selectedGame && (
              <Button 
                className="w-full mt-4 h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
                onClick={() => {
                  const route = GAME_ROUTES[selectedGame];
                  if (route) router.push(`/patient/${patientId}/${route}`);
                }}
              >
                <Gamepad2 className="mr-2 h-5 w-5" />
                {t("play")} {selectedGame && GAMES.find(g => g.id === selectedGame) ? t(GAMES.find(g => g.id === selectedGame)!.nameKey) : ""}
              </Button>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Activities */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-green-500" />
                  {t("todayActivities")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ACTIVITIES.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      activity.completed ? "bg-green-50" : "bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">{activity.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${activity.completed ? "text-green-700" : "text-gray-700"}`}>
                        {t(activity.nameKey)}
                      </p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                    {activity.completed && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-blue-500" />
                  {t("reminders")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {REMINDERS.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-xl flex-shrink-0">{reminder.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {t(reminder.titleKey)}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500 truncate">{reminder.timeKey ? t(reminder.timeKey) : reminder.time}</p>
                      </div>
                    </div>
                    {reminder.recurring && (
                      <Badge variant="outline" className="text-[10px] flex-shrink-0 border-blue-200 text-blue-500">
                        {t("daily")}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-5">
                <div className="text-center">
                  <div className="text-4xl mb-3">🌟</div>
                  <h3 className="font-bold text-gray-800 mb-2">{t("dailyMotivation")}</h3>
                  <p className="text-sm text-gray-600 italic">
                    &ldquo;{t("motivationQuote")}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-xs text-gray-500">{t("fromCaretaker")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Assistant */}
            <VoiceAssistant patientName={patient.name} />

            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="mr-2 h-4 w-4 text-purple-500" />
                  {t("dailyAssessment")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4 text-green-500" />
                  {t("setGoals")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Smile className="mr-2 h-4 w-4 text-yellow-500" />
                  {t("moodCheckin")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4 text-blue-500" />
                  {t("addReminder")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* AI Chatbot */}
      <Chatbot patientName={patient.name} />
    </div>
  );
}
