"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useLanguage } from "@/lib/language-context";
import { LANGUAGES } from "@/lib/translations";

export function ElevenLabsWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const checkAndCreate = () => {
      if (containerRef.current) {
        containerRef.current.replaceChildren();
        const widget = document.createElement("elevenlabs-convai");
        widget.setAttribute("agent-id", "agent_0101m1y9kyggfb3a9fweqvb689sx");
        widget.setAttribute("override-language", language);
        containerRef.current.appendChild(widget);
      }
    };

    checkAndCreate();
    const timer = setTimeout(checkAndCreate, 2000);
    return () => clearTimeout(timer);
  }, [language]);

  return (
    <>
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
      <div className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
        <label htmlFor="elevenlabs-language" className="text-sm font-medium text-foreground">
          Language
        </label>
        <select
          id="elevenlabs-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value as typeof language)}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {LANGUAGES.map((option) => (
            <option key={option.code} value={option.code}>
              {option.nativeName} ({option.name})
            </option>
          ))}
        </select>
      </div>
      <div ref={containerRef} />
    </>
  );
}
