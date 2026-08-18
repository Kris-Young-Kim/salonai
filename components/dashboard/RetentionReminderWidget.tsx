'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  Send,
  MessageCircle,
  Clock,
  Sparkles,
  Phone,
  Copy,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Scissors,
} from 'lucide-react';
import { RetentionCustomerItem } from '@/app/api/crm/retention/route';

export function RetentionReminderWidget() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    dueThisWeek: RetentionCustomerItem[];
    overdue: RetentionCustomerItem[];
    upcoming: RetentionCustomerItem[];
    totalCustomers: number;
    dueCount: number;
    overdueCount: number;
  }>({
    dueThisWeek: [],
    overdue: [],
    upcoming: [],
    totalCustomers: 0,
    dueCount: 0,
    overdueCount: 0,
  });

  const [activeTab, setActiveTab] = useState<'due' | 'overdue' | 'all'>('due');
  const [selectedCustomer, setSelectedCustomer] = useState<RetentionCustomerItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const fetchRetentionData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/retention');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load CRM retention data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetentionData();
  }, []);

  const handleCopyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReminder = async () => {
    if (!selectedCustomer) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/prescriptions/send-kakao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: selectedCustomer.customerName,
          customerPhone: selectedCustomer.customerPhone,
          prescriptionUrl: `/prescription/${selectedCustomer.prescriptionToken}`,
          summary: `[재방문 케어 안내] ${selectedCustomer.retention.rule.description}`,
        }),
      });
      if (res.ok) {
        setSendSuccess(true);
        setTimeout(() => {
          setSendSuccess(false);
          setSelectedCustomer(null);
        }, 1800);
      } else {
        alert('알림톡 전송 중 오류가 발생했습니다.');
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const displayList =
    activeTab === 'due'
      ? data.dueThisWeek
      : activeTab === 'overdue'
      ? data.overdue
      : [...data.dueThisWeek, ...data.overdue, ...data.upcoming];

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-md animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded-xl mb-4" />
        <div className="h-24 bg-zinc-800/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-7 backdrop-blur-md shadow-2xl space-y-5">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              CRM 마케팅 자동화
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>이번 주 재방문 권장 고객</span>
            {data.dueCount > 0 && (
              <span className="rounded-full bg-amber-400 text-zinc-950 px-2 py-0.5 text-xs font-black">
                {data.dueCount}명
              </span>
            )}
          </h2>
        </div>

        {/* Tab Filters */}
        <div className="flex rounded-2xl bg-zinc-950 p-1 border border-zinc-800 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('due')}
            className={`rounded-xl px-3 py-1.5 transition ${
              activeTab === 'due'
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            이번 주 권장 ({data.dueCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            className={`rounded-xl px-3 py-1.5 transition ${
              activeTab === 'overdue'
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            주기 초과 ({data.overdueCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-xl px-3 py-1.5 transition ${
              activeTab === 'all'
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            전체 고객
          </button>
        </div>
      </div>

      {/* Customer List Cards */}
      {displayList.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center space-y-2">
          <Clock className="h-8 w-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-zinc-300">현재 해당하는 재방문 권장 고객이 없습니다.</p>
          <p className="text-xs text-zinc-500">진단이 누적되면 시술 주기에 맞춰 자동으로 추천 목록이 채워집니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map((item) => {
            const isDue = item.retention.status === 'DUE_THIS_WEEK';
            const isOverdue = item.retention.status === 'OVERDUE';

            return (
              <div
                key={item.customerId}
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition ${
                  isDue
                    ? 'bg-gradient-to-br from-zinc-950 to-amber-950/20 border-amber-400/40 shadow-lg'
                    : isOverdue
                    ? 'bg-zinc-950 border-rose-500/30'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.originalImageUrl}
                        alt={item.customerName}
                        className="h-10 w-10 rounded-xl object-cover border border-zinc-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">{item.customerName}</h4>
                          <span className="text-[11px] text-zinc-400 font-mono">{item.customerPhone}</span>
                        </div>
                        <span className="text-[10px] text-amber-300/90 font-medium">
                          #{item.faceShape} • #{item.personalColor}
                        </span>
                      </div>
                    </div>

                    {/* D-Day Badge */}
                    <span
                      className={`rounded-xl px-2.5 py-1 text-xs font-black font-mono shadow-sm ${
                        item.retention.dDayLabel === 'D-Day'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isDue
                          ? 'bg-amber-400 text-zinc-950'
                          : isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {item.retention.dDayLabel}
                    </span>
                  </div>

                  {/* Treatment & Care Advice */}
                  <div className="rounded-xl bg-zinc-900/90 p-3 border border-zinc-800/80 mb-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                      <Scissors className="h-3.5 w-3.5 text-amber-400" />
                      <span>{item.retention.rule.description}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {item.retention.rule.careAdvice}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                  <Link
                    href={`/prescription/${item.prescriptionToken}`}
                    target="_blank"
                    className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-amber-300 transition"
                  >
                    <span>처방전 보기</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(item)}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3.5 py-1.5 text-xs font-bold transition shadow-md active:scale-95"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>안부 알림톡 전송</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reminder Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-amber-400/40 bg-zinc-900 p-6 sm:p-7 shadow-2xl text-white space-y-4">
            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/40">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  [{selectedCustomer.customerName}] 고객님 재방문 안내 알림톡
                </h3>
                <p className="text-xs text-zinc-400 font-mono">{selectedCustomer.customerPhone}</p>
              </div>
            </div>

            {/* Message Preview Box */}
            <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                전송 메시지 미리보기 (카카오 알림톡 / SMS)
              </span>
              <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
                {selectedCustomer.suggestedMessage}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleCopyMessage(selectedCustomer.suggestedMessage)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 py-3 text-xs font-bold text-zinc-200 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">문구 복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-amber-400" />
                    <span>메시지 복사하기</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendReminder}
                disabled={isSending || sendSuccess}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 py-3 text-xs font-bold text-zinc-950 shadow-lg hover:brightness-105 transition disabled:opacity-50"
              >
                {sendSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-zinc-950" />
                    <span>발송 완료!</span>
                  </>
                ) : isSending ? (
                  <span>발송 중...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>즉시 발송하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
