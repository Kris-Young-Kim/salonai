import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import { Scissors } from "lucide-react";
import { SidebarNav, MobileBottomNav } from "@/components/dashboard/SidebarNav";

export const metadata: Metadata = {
  title: "유니헤어샵 — 디자이너 대시보드",
  description: "유니헤어샵 AI 헤어 진단 & 고객 레시피 관리 대시보드",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-zinc-950">
      {/* Sidebar — tablet landscape */}
      <aside className="hidden md:flex w-56 flex-col border-r border-zinc-800/80 bg-zinc-900/70 backdrop-blur-md shrink-0">
        {/* Brand mark */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-zinc-800/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-900/40">
            <Scissors className="h-4 w-4 text-zinc-950" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">유니헤어샵</p>
            <p className="text-[9px] text-zinc-500 tracking-widest uppercase font-medium">원주 원동점</p>
          </div>
        </div>

        <SidebarNav />

        {/* Bottom: User */}
        <div className="border-t border-zinc-800/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <UserButton />
            <p className="text-xs text-zinc-500 font-medium">계정 관리</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-zinc-800/80 bg-zinc-900/95 backdrop-blur-md">
        <MobileBottomNav />
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
