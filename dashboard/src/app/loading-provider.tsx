"use client";

import { useState, useEffect } from "react";
import { FullPageLoader } from "@/components/application/loading-indicator/loading-indicator";

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loading for 1.5s on initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <FullPageLoader label="Loading NeuroSmriti..." />;
  }

  return <>{children}</>;
}
