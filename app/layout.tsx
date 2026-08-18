import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Camera } from "lucide-react";
import { HeaderAuth } from "@/components/layout/HeaderAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalonAI — AI 헤어 진단 솔루션",
  description: "미용실 전용 AI 얼굴형·퍼스널컬러 진단 & 디지털 처방전",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        <ClerkProvider>
          <header className="flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-6 backdrop-blur-md sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-zinc-950 font-black text-sm shadow-[0_0_15px_rgba(245,208,97,0.4)]">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-amber-300 transition">
                  SalonAI
                </span>
                <span className="text-[9px] tracking-widest text-zinc-400 uppercase font-medium">
                  Hair AI Solution
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/diagnose"
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>진단 시작</span>
              </Link>

              <HeaderAuth />
            </div>
          </header>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
