"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Heart, Gamepad2, Sparkles, Globe, Check } from "lucide-react";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useLanguage } from "@/lib/language-context";
import { LANGUAGES, Language } from "@/lib/translations";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("caretaker");
  const [step, setStep] = useState<"language" | "login">("login");

  useEffect(() => {
    const saved = localStorage.getItem("neurosmriti_language");
    if (!saved) {
      setStep("language");
    }
  }, []);
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setStep("login");
  };

  const handleCaretakerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 500);
  };

  const handlePatientLogin = async (patientId: string) => {
    setLoading(true);
    setTimeout(() => router.push(`/patient/${patientId}`), 500);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl overflow-hidden shadow-xl">
          <img src="/logo-icon.jpeg" alt="NeuroSmriti" className="w-full h-full object-cover" />
        </div>
        <LoadingIndicator type="dot-circle" size="lg" label={t("signingIn")} />
        <h1 className="mt-6 text-2xl font-bold text-teal-700">{t("appName")}</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden shadow-xl">
            <img src="/logo-icon.jpeg" alt="NeuroSmriti Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-teal-700">
            {t("appName")}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {t("tagline")}
          </p>
        </div>

        {/* Language Selector */}
        {step === "language" ? (
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 mb-3">
                  <Globe className="h-6 w-6 text-teal-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{t("selectLanguage")}</h2>
              </div>
              <div className="space-y-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      language === lang.code
                        ? "border-teal-400 bg-teal-50"
                        : "border-gray-100 hover:border-teal-200 hover:bg-teal-50"
                    }`}
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-800">{lang.nativeName}</p>
                      <p className="text-sm text-gray-500">{lang.name}</p>
                    </div>
                    {language === lang.code && (
                      <Check className="h-5 w-5 text-teal-500" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Language Switcher */}
            <div className="flex justify-center">
              <button
                onClick={() => setStep("language")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-sm text-gray-600 hover:bg-white transition-colors shadow-sm"
              >
                <Globe className="h-4 w-4" />
                {LANGUAGES.find((l) => l.code === language)?.nativeName}
                <span className="text-gray-400">•</span>
                <span className="text-teal-600 text-xs">Change</span>
              </button>
            </div>

            {/* Login Card with simple tabs */}
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Tab Headers */}
                <div className="grid w-full grid-cols-2 h-14 bg-gray-50">
                  <button
                    onClick={() => setActiveTab("caretaker")}
                    className={`flex items-center justify-center font-semibold transition-all ${
                      activeTab === "caretaker"
                        ? "bg-white shadow-sm text-teal-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {t("caretakerPortal")}
                  </button>
                  <button
                    onClick={() => setActiveTab("patient")}
                    className={`flex items-center justify-center font-semibold transition-all ${
                      activeTab === "patient"
                        ? "bg-white shadow-sm text-teal-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {t("patientPortal")}
                  </button>
                </div>

                {/* Caretaker Login */}
                {activeTab === "caretaker" && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 mb-3">
                          <Shield className="h-6 w-6 text-teal-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">{t("caretakerAccess")}</h2>
                        <p className="text-sm text-gray-500">{t("monitorHealth")}</p>
                      </div>

                      <form onSubmit={handleCaretakerLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            {t("email")}
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="caretaker@example.com"
                              className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            {t("password")}
                          </Label>
                          <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="h-12 w-full text-base font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                          size="lg"
                        >
                          {loading ? (
                            t("signingIn")
                          ) : (
                            <>
                              {t("signIn")}
                              <Sparkles className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>

                      <p className="text-center text-xs text-gray-400 mt-4">
                        {t("demoHint")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Patient Login */}
                {activeTab === "patient" && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                          <Heart className="h-6 w-6 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">{t("patientAccess")}</h2>
                        <p className="text-sm text-gray-500">{t("playGames")}</p>
                      </div>

                      <div className="space-y-3">
                        {[
                          { id: "patient_1", name: "Kamala Devi", age: 72, icon: "👵" },
                          { id: "patient_2", name: "Ramesh Kalita", age: 68, icon: "👴" },
                          { id: "patient_3", name: "Priya Boro", age: 75, icon: "👵" },
                        ].map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handlePatientLogin(patient.id)}
                            disabled={loading}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200 group"
                          >
                            <div className="text-3xl">{patient.icon}</div>
                            <div className="text-left flex-1">
                              <p className="font-semibold text-gray-800 group-hover:text-purple-700">
                                {patient.name}
                              </p>
                              <p className="text-sm text-gray-500">{t("age")}: {patient.age}</p>
                            </div>
                            <div className="text-purple-400 group-hover:text-purple-600">
                              <Gamepad2 className="h-5 w-5" />
                            </div>
                          </button>
                        ))}
                      </div>

                      <p className="text-center text-xs text-gray-400 mt-4">
                        {t("selectProfile")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          {t("footer")}
        </p>
      </div>
    </div>
  );
}
