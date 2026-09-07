"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Activity,
  Heart,
  Brain,
  AlertTriangle,
  Clock,
  Pill,
  Thermometer,
  Droplets,
  Shield,
  Gamepad2,
  Star,
  Trophy,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useRouter } from "next/navigation";
import {
  getMockPatients,
  getMockAlerts,
  PatientData,
} from "@/lib/firebase";
import {
  getAllGameStats,
  getAccuracy,
  DIFFICULTY_LEVELS,
  type AllGameStats,
} from "@/lib/game-utils";

export default function DashboardPage() {
  const patients = getMockPatients();
  const [selected, setSelected] = useState<PatientData>(patients[0]);
  const router = useRouter();
  const [gameStats, setGameStats] = useState<AllGameStats | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useLanguage();

  useEffect(() => {
    const stats = getAllGameStats(selected.id);
    setGameStats(stats);
  }, [selected.id]);

  const alerts = getMockAlerts();

  const vitals = {
    heartRate: 72,
    bloodPressure: "120/80",
    temperature: 98.6,
    oxygenLevel: 98,
    lastChecked: t("lastChecked"),
  };

  const medications = [
    { name: "Donepezil", time: "8:00 AM", taken: true },
    { name: "Memantine", time: "2:00 PM", taken: false },
    { name: "Vitamin D", time: "8:00 AM", taken: true },
  ];

  const tabs = [
    { id: "overview", label: `📊 ${t("overview")}` },
    { id: "health", label: `💊 ${t("health")}` },
    { id: "progress", label: `📈 ${t("progress")}` },
    { id: "alerts", label: `🔔 ${t("alerts")}` },
  ];

  const cognitiveDomains = [
    { key: "memory", val: 72 },
    { key: "attention", val: 65 },
    { key: "pattern", val: 78 },
    { key: "routine", val: 80 },
    { key: "emotional", val: 70 },
  ];

  const progressDomains = [
    { key: "memory", val: 72, trend: "↑", color: "text-green-500" },
    { key: "attention", val: 65, trend: "→", color: "text-gray-500" },
    { key: "pattern", val: 78, trend: "↑", color: "text-green-500" },
    { key: "routine", val: 80, trend: "↑", color: "text-green-500" },
    { key: "emotional", val: 70, trend: "↓", color: "text-red-500" },
    { key: "language", val: 68, trend: "→", color: "text-gray-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/logo-icon.jpeg" alt="NeuroSmriti" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">{t("appName")}</h1>
                <p className="text-xs text-gray-500">{t("caretakerDashboard")}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-full">
              <Shield className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">{t("caretaker")}</span>
            </div>
            <select
              value={selected.id}
              onChange={(e) =>
                setSelected(patients.find((p) => p.id === e.target.value)!)
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Patient Info Card */}
        <Card className="mb-6 border-0 shadow-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full border-3 border-white/30 bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  <p className="text-emerald-100">{t("age")}: {selected.age}</p>
                  <p className="text-emerald-100 text-sm">
                    {t("lastActive")}: {formatTimeAgo(selected.lastActive)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{selected.overallScore}%</div>
                <p className="text-emerald-100">{t("cognitiveScore")}</p>
                <Badge className="mt-2 bg-white/20 text-white border-0">
                  {selected.streak} {t("dayStreak")} 🔥
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto text-red-500 mb-2" />
              <p className="text-xl font-bold text-gray-800">{vitals.heartRate}</p>
              <p className="text-xs text-gray-500">{t("heartRate")}</p>
              <p className="text-xs text-green-500 mt-1">{t("normal")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 mx-auto text-blue-500 mb-2" />
              <p className="text-xl font-bold text-gray-800">{vitals.bloodPressure}</p>
              <p className="text-xs text-gray-500">{t("bloodPressure")}</p>
              <p className="text-xs text-green-500 mt-1">{t("normal")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Thermometer className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-xl font-bold text-gray-800">{vitals.temperature}°F</p>
              <p className="text-xs text-gray-500">{t("temperature")}</p>
              <p className="text-xs text-green-500 mt-1">{t("normal")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Droplets className="h-6 w-6 mx-auto text-cyan-500 mb-2" />
              <p className="text-xl font-bold text-gray-800">{vitals.oxygenLevel}%</p>
              <p className="text-xs text-gray-500">{t("oxygenLevel")}</p>
              <p className="text-xs text-green-500 mt-1">{t("normal")}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto text-purple-500 mb-2" />
              <p className="text-sm font-bold text-gray-800">{vitals.lastChecked}</p>
              <p className="text-xs text-gray-500">{t("lastChecked")}</p>
              <p className="text-xs text-blue-500 mt-1">{t("viewHistory")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Simple Tabs (no @base-ui/react dependency) */}
        <div className="space-y-6">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white shadow-sm text-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Cognitive Progress */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      {t("cognitiveProgress")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cognitiveDomains.map((domain) => (
                      <div key={domain.key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{t(domain.key)}</span>
                          <span className="text-muted-foreground">
                            {domain.val}%
                          </span>
                        </div>
                        <Progress value={domain.val} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Medications */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      {t("medications")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {medications.map((med) => (
                      <div
                        key={med.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            med.taken ? "bg-green-100" : "bg-orange-100"
                          }`}>
                            <Pill className={`h-4 w-4 ${
                              med.taken ? "text-green-600" : "text-orange-600"
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{med.name}</p>
                            <p className="text-xs text-gray-500">{med.time}</p>
                          </div>
                        </div>
                        <Badge variant={med.taken ? "default" : "secondary"}>
                          {med.taken ? t("taken") : t("pending")}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4">
                      <Pill className="mr-2 h-4 w-4" />
                      {t("addMedication")}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Game Statistics */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-emerald-500" />
                    {t("gamePerformance")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gameStats ? (
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-emerald-50 text-center">
                          <Trophy className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                          <p className="text-lg font-bold text-emerald-700">
                            {Object.values(gameStats).reduce((sum, g) => sum + g.gamesPlayed, 0)}
                          </p>
                          <p className="text-xs text-emerald-600">{t("totalGames")}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 text-center">
                          <Star className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                          <p className="text-lg font-bold text-blue-700">
                            {Math.max(...Object.values(gameStats).map(g => g.unlockedLevel))}
                          </p>
                          <p className="text-xs text-blue-600">{t("maxLevel")}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-50 text-center">
                          <Brain className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                          <p className="text-lg font-bold text-purple-700">
                            {(() => {
                              const total = Object.values(gameStats).reduce((sum, g) => sum + g.totalCorrect, 0);
                              const attempts = Object.values(gameStats).reduce((sum, g) => sum + g.totalAttempts, 0);
                              return attempts > 0 ? Math.round((total / attempts) * 100) : 0;
                            })()}%
                          </p>
                          <p className="text-xs text-purple-600">{t("accuracy")}</p>
                        </div>
                      </div>

                      {/* Per-game stats */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {([
                          { key: "memory_match" as const, nameKey: "memoryMatch", icon: "🃏" },
                          { key: "pattern_recognition" as const, nameKey: "patternRecall", icon: "🎯" },
                          { key: "daily_routine" as const, nameKey: "dailyRoutine", icon: "📋" },
                          { key: "object_recognition" as const, nameKey: "objectId", icon: "🔍" },
                          { key: "attention_focus" as const, nameKey: "focusTest", icon: "🧩" },
                          { key: "emotional_engagement" as const, nameKey: "emotionMatch", icon: "😊" },
                        ]).map((game) => {
                          const stats = gameStats[game.key];
                          const accuracy = getAccuracy(stats);
                          const levelConfig = DIFFICULTY_LEVELS[Math.min(stats.currentLevel - 1, 4)];
                          return (
                            <div
                              key={game.key}
                              className="p-3 rounded-lg border border-gray-100 hover:border-emerald-200 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-lg">{game.icon}</span>
                                <Badge className={`text-xs ${levelConfig.color}`}>
                                  <Star className="h-3 w-3 mr-1" />
                                  {levelConfig.name}
                                </Badge>
                              </div>
                              <p className="font-medium text-gray-800 text-sm">{t(game.nameKey)}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-lg font-bold">{accuracy}%</span>
                                <span className="text-xs text-gray-400">
                                  {stats.gamesPlayed} {t("gamesPlayed")}
                                </span>
                              </div>
                              <Progress value={accuracy} className="mt-2 h-1.5" />
                              {stats.gamesPlayed > 0 && (
                                <p className="text-[10px] text-gray-400 mt-1.5">
                                  {stats.totalCorrect}/{stats.totalAttempts} {t("correct")} • {t("level")} {stats.currentLevel}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400">
                      <p>{t("loadingStats")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* HEALTH TAB */}
          {activeTab === "health" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{t("healthSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-green-50">
                      <p className="text-sm text-green-600 font-medium">{t("overallHealth")}</p>
                      <p className="text-2xl font-bold text-green-700">{t("good")}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50">
                      <p className="text-sm text-blue-600 font-medium">{t("sleepQuality")}</p>
                      <p className="text-2xl font-bold text-blue-700">7.5h</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50">
                      <p className="text-sm text-purple-600 font-medium">{t("hydration")}</p>
                      <p className="text-2xl font-bold text-purple-700">6/8 {t("cups")}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50">
                      <p className="text-sm text-orange-600 font-medium">{t("nutrition")}</p>
                      <p className="text-2xl font-bold text-orange-700">3 {t("meals")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{t("recentObservations")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { note: t("observation1"), time: "10:30 AM", type: "positive" },
                    { note: t("observation2"), time: "2:15 PM", type: "concern" },
                    { note: t("observation3"), time: "6:00 PM", type: "positive" },
                  ].map((obs, i) => (
                    <div key={i} className={`p-3 rounded-lg ${
                      obs.type === "positive" ? "bg-green-50" : "bg-yellow-50"
                    }`}>
                      <p className="text-sm text-gray-700">{obs.note}</p>
                      <p className="text-xs text-gray-500 mt-1">{obs.time}</p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
                    {t("addObservation")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* PROGRESS TAB */}
          {activeTab === "progress" && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>{t("detailedProgress")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {progressDomains.map((domain) => (
                    <Card key={domain.key} className="border border-gray-100">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t(domain.key)}
                          </span>
                          <span className={`text-lg font-bold ${domain.color}`}>
                            {domain.trend}
                          </span>
                        </div>
                        <div className="text-3xl font-bold mb-3">
                          {domain.val}%
                        </div>
                        <Progress value={domain.val} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ALERTS TAB */}
          {activeTab === "alerts" && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  {t("allAlerts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-4 hover:border-orange-200 transition-colors">
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "destructive"
                            : alert.severity === "warning"
                              ? "secondary"
                              : "outline"
                        }
                        className="mt-0.5 shrink-0"
                      >
                        {alert.severity}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────── */

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
