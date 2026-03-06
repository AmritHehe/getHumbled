import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/Toaster";
import { SpeedInsights } from '@vercel/speed-insights/next';

import { Analytics } from "@vercel/analytics/next"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "SkillUp - Level Up Your Coding Skills",
    template: "%s | SkillUp",
  },
  description: "Compete in live coding contests, master DSA and development challenges, and track your progress on the global leaderboard.",
  keywords: ["coding", "contests", "DSA", "development", "competitive programming", "leaderboard", "quiz", "practice"],
  openGraph: {
    title: "SkillUp - Level Up Your Coding Skills",
    description: "Compete in live coding contests, master DSA and development challenges, and climb the leaderboard.",
    type: "website",
    siteName: "SkillUp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Autm8n — Node Based Automation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillUp - Level Up Your Coding Skills",
    description: "Compete in live coding contests, master DSA and development challenges.",
    images: ["https://autm8n.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 pt-14">
                {children}
                <Analytics />
                <SpeedInsights />
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
