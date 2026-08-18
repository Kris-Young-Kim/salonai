import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Camera, ClipboardList } from "lucide-react";
import { HeaderAuth } from "@/components/layout/HeaderAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "유니헤어샵 | AI 헤어 스타일 컨설팅 & 맞춤 레시피",
  description: "유니헤어샵 전용 AI 얼굴형·퍼스널컬러 스타일 컨설팅 & 맞춤 헤어 레시피 (원주 무실로 91)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans" suppressHydrationWarning>
        <ClerkProvider>
          <header className="flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-6 backdrop-blur-md sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-zinc-950 font-black text-sm shadow-[0_0_15px_rgba(245,208,97,0.4)]">
                U
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-amber-300 transition">
                  유니헤어샵
                </span>
                <span className="text-[9px] tracking-widest text-zinc-400 uppercase font-medium">
                  Hair Salon & AI Studio
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <Link
                href="/dashboard/records"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition shadow-sm"
              >
                <ClipboardList className="h-3.5 w-3.5 text-amber-400" />
                <span>스타일 보관함</span>
              </Link>

              <Link
                href="/diagnose"
                className="flex items-center gap-1.5 rounded-xl bg-amber-400/15 border border-amber-400/40 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/25 transition shadow-[0_0_15px_rgba(245,208,97,0.15)]"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>스타일 컨설팅</span>
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
