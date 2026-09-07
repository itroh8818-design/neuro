import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/language-context";
import { AppLoader } from "./loading-provider";
import { ElevenLabsWidget } from "@/components/ElevenLabsWidget";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "NeuroSmriti — AI Cognitive Wellness",
  description:
    "AI-powered cognitive gaming and memory assistance platform for elderly patients",
  icons: {
    icon: "/logo-icon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans antialiased", atkinson.variable)}>
      <body className="min-h-screen bg-background text-foreground">
        <LanguageProvider>
          <AppLoader>{children}</AppLoader>
          <ElevenLabsWidget />
          <Toaster richColors position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  );
}
