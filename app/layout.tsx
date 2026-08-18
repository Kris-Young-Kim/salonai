import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Camera, ClipboardList } from "lucide-react";
import { HeaderAuth } from "@/components/layout/HeaderAuth";
import { FullscreenToggle } from "@/components/common/FullscreenToggle";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "유니헤어샵 | AI 헤어 스타일 컨설팅 & 맞춤 레시피",
  description: "유니헤어샵 전용 AI 얼굴형·퍼스널컬러 스타일 컨설팅 & 맞춤 헤어 레시피 (원주 무실로 91)",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "유니헤어샵",
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-400 selection:text-zinc-950" suppressHydrationWarning>
        <ClerkProvider>
          <header className="flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 sm:px-6 backdrop-blur-md sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-amber-400/40 shadow-[0_0_15px_rgba(245,208,97,0.35)] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.jpg"
                  alt="유니헤어샵 공식 로고"
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                />
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

            <div className="flex items-center gap-2 sm:gap-3">
              <FullscreenToggle />

              <Link
                href="/dashboard/records"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition shadow-sm"
              >
                <ClipboardList className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">스타일 보관함</span>
              </Link>

              <Link
                href="/diagnose"
                className="flex items-center gap-1.5 rounded-xl bg-amber-400/15 border border-amber-400/40 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/25 transition shadow-[0_0_15px_rgba(245,208,97,0.15)]"
              >
                <Camera className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">스타일 컨설팅</span>
              </Link>

              <HeaderAuth />
            </div>
          </header>
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
          <PwaInstallPrompt />
        </ClerkProvider>
      </body>
    </html>
  );
}
