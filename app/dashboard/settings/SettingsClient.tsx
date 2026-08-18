'use client';

import { useState } from 'react';
import { UserProfile } from '@clerk/nextjs';
import { Building2, User, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  initialSalon: { name: string; address: string };
  initialDesigner: { name: string; email: string };
}

export default function SettingsClient({ initialSalon, initialDesigner }: Props) {
  const [salonName, setSalonName] = useState(initialSalon.name);
  const [salonAddress, setSalonAddress] = useState(initialSalon.address);
  const [designerName, setDesignerName] = useState(initialDesigner.name);
  const [designerEmail, setDesignerEmail] = useState(initialDesigner.email);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonName, salonAddress, designerName, designerEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || '저장에 실패했습니다.' });
      } else {
        setFeedback({ type: 'success', message: '설정이 저장되었습니다.' });
      }
    } catch {
      setFeedback({ type: 'error', message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-950 text-white px-4 sm:px-6 md:px-10 py-8 max-w-3xl mx-auto">

      {/* ── 헤더 ─────────────────────────────────────────────────────────────── */}
      <header className="mb-8 border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">설정</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">
          살롱 정보와 디자이너 프로필을 관리합니다.
        </p>
      </header>

      <div className="space-y-6">

        {/* ── 섹션 1: 살롱 정보 ─────────────────────────────────────────────── */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">살롱 정보</h2>
              <p className="text-xs text-zinc-500">매장명과 주소를 수정합니다.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">매장명</label>
              <input
                type="text"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                placeholder="살롱 이름을 입력하세요"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">주소</label>
              <input
                type="text"
                value={salonAddress}
                onChange={(e) => setSalonAddress(e.target.value)}
                placeholder="살롱 주소를 입력하세요"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none transition"
              />
            </div>
          </div>
        </section>

        {/* ── 섹션 2: 디자이너 프로필 ────────────────────────────────────────── */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">디자이너 프로필</h2>
              <p className="text-xs text-zinc-500">담당 디자이너 이름과 연락 이메일을 수정합니다.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">이름</label>
              <input
                type="text"
                value={designerName}
                onChange={(e) => setDesignerName(e.target.value)}
                placeholder="디자이너 이름을 입력하세요"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">이메일</label>
              <input
                type="email"
                value={designerEmail}
                onChange={(e) => setDesignerEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none transition"
              />
            </div>
          </div>
        </section>

        {/* ── 피드백 + 저장 버튼 ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {feedback && (
            <div
              className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium ${
                feedback.type === 'success'
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                  : 'border-red-400/30 bg-red-400/10 text-red-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {feedback.message}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-3.5 text-sm font-bold text-zinc-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? '저장 중...' : '설정 저장'}
          </button>
        </div>

        {/* ── 섹션 3: 계정 관리 (Clerk UserProfile) ─────────────────────────── */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-md overflow-hidden">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">계정 관리</h2>
              <p className="text-xs text-zinc-500">비밀번호, 프로필 사진, 연결된 소셜 계정을 관리합니다.</p>
            </div>
          </div>
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none border-0 rounded-none p-0',
                navbar: 'border-zinc-800 bg-transparent',
                navbarButton: 'text-zinc-400',
                navbarButton__active: 'text-amber-400',
                headerTitle: 'text-white',
                headerSubtitle: 'text-zinc-400',
                profileSectionTitle: 'text-zinc-200',
                profileSectionTitleText: 'text-zinc-200',
                profileSectionContent: 'text-zinc-300',
                formFieldLabel: 'text-zinc-400 text-xs font-semibold',
                formFieldInput: 'bg-zinc-900 border-zinc-700 text-white rounded-xl',
                formButtonPrimary: 'bg-amber-400 text-zinc-950 hover:bg-amber-300 rounded-xl font-bold',
                footerActionLink: 'text-amber-400',
                badge: 'bg-amber-400/10 text-amber-300 border border-amber-400/20',
              },
            }}
          />
        </section>

      </div>
    </div>
  );
}
