import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Camera, ClipboardList } from "lucide-react";
import { HeaderAuth } from "@/components/layout/HeaderAuth";
import { FullscreenToggle } from "@/components/common/FullscreenToggle";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
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
  metadataBase: new URL("https://salon-vivid.vercel.app"),
  title: {
    default: "유니헤어샵 | AI 헤어 스타일 컨설팅 & 맞춤 레시피",
    template: "%s | 유니헤어샵",
  },
  description: "원주 원동 유니헤어샵 AI 1분 얼굴형·퍼스널컬러 진단 및 디자이너 맞춤 헤어 레시피 솔루션",
  keywords: [
    "유니헤어샵",
    "원주미용실",
    "원주헤어샵",
    "원동미용실",
    "AI헤어스타일",
    "퍼스널컬러진단",
    "얼굴형맞춤헤어",
    "헤어처방전",
  ],
  authors: [{ name: "유니헤어샵 (원주 원동점)" }],
  creator: "유니헤어샵",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "유니헤어샵",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://salon-vivid.vercel.app",
    siteName: "유니헤어샵 AI 살롱",
    title: "유니헤어샵 | 1분 AI 헤어 스타일 컨설팅 & 맞춤 레시피",
    description: "내 얼굴형과 피부톤에 딱 맞는 인생 헤어스타일을 AI로 1분 만에 진단받으세요. (강원 원주시 무실로 91, 원동)",
    images: [
      {
        url: "/og-image.jpg",
        width: 800,
        height: 800,
        alt: "유니헤어샵 공식 로고",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "유니헤어샵 | AI 헤어 스타일 컨설팅",
    description: "내 얼굴형과 피부톤에 딱 맞는 인생 헤어스타일 1분 AI 진단 (원주 원동)",
    images: ["/og-image.jpg"],
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
          <ServiceWorkerRegistration />
        </ClerkProvider>
      </body>
    </html>
  );
}
