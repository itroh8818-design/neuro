"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export function ElevenLabsWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for the script to load, then create the widget element
    const checkAndCreate = () => {
      if (containerRef.current && !containerRef.current.querySelector("elevenlabs-convai")) {
        const widget = document.createElement("elevenlabs-convai");
        widget.setAttribute("agent-id", "agent_0101m1y9kyggfb3a9fweqvb689sx");
        containerRef.current.appendChild(widget);
      }
    };

    // Try immediately and also after a delay
    checkAndCreate();
    const timer = setTimeout(checkAndCreate, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
      <div ref={containerRef} />
    </>
  );
}
