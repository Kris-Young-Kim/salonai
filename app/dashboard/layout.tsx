import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Scissors, LayoutDashboard, Camera, ClipboardList, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "유니헤어샵 — 디자이너 대시보드",
  description: "유니헤어샵 AI 헤어 진단 & 고객 레시피 관리 대시보드",
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "홈" },
  { href: "/diagnose", icon: Camera, label: "스타일 컨설팅" },
  { href: "/dashboard/records", icon: ClipboardList, label: "스타일 보관함" },
  { href: "/dashboard/settings", icon: Settings, label: "설정" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F9FAFB]">
      {/* Sidebar — tablet landscape */}
      <aside className="hidden md:flex w-64 flex-col border-r border-stone-200 bg-white shadow-sm shrink-0">
        {/* Brand mark inside sidebar */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-stone-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-800 tracking-tight">유니헤어샵</p>
            <p className="text-[10px] text-stone-400 tracking-widest uppercase font-medium">원주 무실점</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-stone-500 hover:bg-amber-50 hover:text-amber-700 transition-colors group"
            >
              <Icon className="h-5 w-5 shrink-0 group-hover:text-amber-600 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom: User */}
        <div className="border-t border-stone-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <UserButton />
            <p className="text-xs text-stone-400 font-medium">계정 관리</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-md">
        <nav className="flex items-center justify-around py-2">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-4 py-2 text-stone-400 hover:text-amber-600 transition-colors"
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
