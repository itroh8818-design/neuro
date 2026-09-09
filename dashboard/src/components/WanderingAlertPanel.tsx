"use client";

import { useState } from "react";
import { Bell, Check, Clock3, MapPin, Navigation, Phone, Radio, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PatientData } from "@/lib/firebase";

type SafetyState = "outside" | "inside";

interface WanderingAlertPanelProps {
  patient: PatientData;
}

const safeZone = {
  address: "Home · 14 Nehru Road",
  radius: "250 m radius",
  coordinates: "26.1445° N, 91.7362° E",
};

export function WanderingAlertPanel({ patient }: WanderingAlertPanelProps) {
  const [status, setStatus] = useState<SafetyState>("outside");
  const [acknowledged, setAcknowledged] = useState(false);
  const [lastAction, setLastAction] = useState("Alert sent 2 min ago");
  const isOutside = status === "outside";

  const simulateStatus = (nextStatus: SafetyState) => {
    setStatus(nextStatus);
    setAcknowledged(false);
    setLastAction(nextStatus === "outside" ? "Alert sent just now" : "Safe return logged just now");
  };

  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-950 px-5 py-4 text-white sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300"><Radio className="h-3.5 w-3.5" />Safety watch · demo mode</div>
            <CardTitle className="text-xl text-white">Wandering alert + Geofence SOS</CardTitle>
            <p className="mt-1 text-sm text-slate-300">Live location protection for {patient.name}</p>
          </div>
          <Badge className={isOutside ? "border-0 bg-red-500 text-white" : "border-0 bg-emerald-500 text-white"}>
            <span className={`mr-2 h-2 w-2 rounded-full bg-white ${isOutside ? "animate-pulse" : ""}`} />
            {isOutside ? "Outside safe zone" : "Inside safe zone"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[300px] overflow-hidden border-b border-slate-100 bg-[#e7f3f0] lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(32deg, transparent 47%, rgba(37, 99, 93, .18) 48%, rgba(37, 99, 93, .18) 52%, transparent 53%), linear-gradient(118deg, transparent 48%, rgba(37, 99, 93, .13) 49%, rgba(37, 99, 93, .13) 51%, transparent 52%), linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)", backgroundSize: "170px 130px, 210px 150px, 28px 28px, 28px 28px" }} />
            <div className="absolute left-[18%] top-[16%] h-52 w-52 rounded-full border border-emerald-500/45 bg-emerald-400/10 sm:h-60 sm:w-60" />
            <div className="absolute left-[calc(18%+94px)] top-[calc(16%+92px)] h-3 w-3 rounded-full bg-emerald-600 shadow-[0_0_0_7px_rgba(16,185,129,.16)]" />
            <div className="absolute left-[64%] top-[57%] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"><MapPin className="h-5 w-5" fill="currentColor" /></div>
            <div className="absolute left-[64%] top-[57%] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/70 animate-ping" />
            <div className="absolute left-5 top-5 rounded-md border border-white/80 bg-white/90 px-3 py-2 shadow-sm"><p className="text-xs font-semibold text-slate-800">Safe zone</p><p className="text-[11px] text-slate-500">{safeZone.radius}</p></div>
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-lg border border-white/80 bg-white/90 px-3 py-2.5 shadow-sm"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{patient.name} · current location</p><p className="text-xs text-slate-500">Updated 2 min ago · GPS accuracy ±8 m</p></div><Navigation className={`h-5 w-5 shrink-0 ${isOutside ? "text-red-600" : "text-emerald-600"}`} /></div>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            <div className={`rounded-lg border p-4 ${isOutside ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
              <div className="flex items-start gap-3">{isOutside ? <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}<div><p className={`font-semibold ${isOutside ? "text-red-900" : "text-emerald-900"}`}>{isOutside ? `${patient.name} left the safe zone` : `${patient.name} is back in the safe zone`}</p><p className={`mt-1 text-sm ${isOutside ? "text-red-700" : "text-emerald-700"}`}>{isOutside ? "Caregiver notification is active. SOS actions are ready." : "Location monitoring is active and no action is needed."}</p></div></div>
            </div>
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Safe zone</p><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><MapPin className="h-4 w-4" /></div><div><p className="font-semibold text-slate-800">{safeZone.address}</p><p className="mt-0.5 text-xs text-slate-500">{safeZone.radius} · {safeZone.coordinates}</p></div></div></div>
            <div className="grid grid-cols-2 gap-2"><Button variant="outline" className="h-10 border-slate-200 text-slate-700" onClick={() => simulateStatus("outside")}><MapPin className="mr-2 h-4 w-4 text-red-500" />Simulate exit</Button><Button variant="outline" className="h-10 border-slate-200 text-slate-700" onClick={() => simulateStatus("inside")}><Check className="mr-2 h-4 w-4 text-emerald-600" />Simulate return</Button></div>
            <div className="border-t border-slate-100 pt-4"><div className="flex items-center justify-between gap-3 text-xs text-slate-500"><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{lastAction}</span><span>{acknowledged ? "Closed" : "Open"}</span></div><div className="mt-3 grid grid-cols-2 gap-2"><Button className="h-10 bg-slate-900 text-white hover:bg-slate-800" onClick={() => { setAcknowledged(true); setLastAction("Alert acknowledged by caregiver"); }} disabled={!isOutside || acknowledged}><Bell className="mr-2 h-4 w-4" />{acknowledged ? "Acknowledged" : "Acknowledge"}</Button><Button variant="outline" className="h-10 border-red-200 text-red-700 hover:bg-red-50"><Phone className="mr-2 h-4 w-4" />Call caregiver</Button></div></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
