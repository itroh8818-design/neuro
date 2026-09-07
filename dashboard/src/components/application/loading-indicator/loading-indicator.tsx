"use client";

import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  type?: "dot-circle" | "spinner" | "dots";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

function DotCircle({ size }: { size: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-8 w-8", md: "h-14 w-14", lg: "h-20 w-20" };
  const dotSize = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-3 w-3" };

  return (
    <div className={cn("relative", sizeMap[size])}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "absolute rounded-full bg-teal-500 animate-pulse",
            dotSize[size]
          )}
          style={{
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-${size === "lg" ? 28 : size === "md" ? 20 : 14}px)`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: "1.2s",
          }}
        />
      ))}
      {/* Center circle */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 animate-ping",
          size === "lg" ? "h-4 w-4" : size === "md" ? "h-3 w-3" : "h-2 w-2"
        )}
        style={{ animationDuration: "1.5s" }}
      />
    </div>
  );
}

function Spinner({ size }: { size: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-6 w-6", md: "h-10 w-10", lg: "h-16 w-16" };
  return (
    <div
      className={cn(
        "border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin",
        sizeMap[size]
      )}
    />
  );
}

function Dots({ size }: { size: "sm" | "md" | "lg" }) {
  const dotMap = { sm: "h-2 w-2", md: "h-3 w-3", lg: "h-4 w-4" };
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "rounded-full bg-teal-500 animate-bounce",
            dotMap[size]
          )}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

export function LoadingIndicator({
  type = "dot-circle",
  size = "md",
  label,
  className,
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      {type === "dot-circle" && <DotCircle size={size} />}
      {type === "spinner" && <Spinner size={size} />}
      {type === "dots" && <Dots size={size} />}
      {label && (
        <p className="text-sm text-gray-500 animate-pulse font-medium">
          {label}
        </p>
      )}
    </div>
  );
}

export function FullPageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      {/* Logo */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl overflow-hidden shadow-xl">
        <img
          src="/logo-icon.jpeg"
          alt="NeuroSmriti"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Loading animation */}
      <LoadingIndicator type="dot-circle" size="lg" label={label} />

      {/* Brand name */}
      <h1 className="mt-6 text-2xl font-bold text-teal-700">NeuroSmriti</h1>
      <p className="mt-1 text-sm text-gray-500">Cognitive care, in your language</p>
    </div>
  );
}
