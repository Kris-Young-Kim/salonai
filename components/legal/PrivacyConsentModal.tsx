'use client';

import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export function PrivacyConsentModal({ isOpen, onClose, onAccept }: PrivacyConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-700 bg-zinc-900 text-white p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">개인정보 수집 및 이용 동의</h2>
              <p className="text-[11px] text-zinc-400">유니헤어샵 AI 스타일 컨설팅 서비스</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs text-zinc-300 leading-relaxed pr-1 custom-scrollbar">
          
          <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800">
            <h3 className="font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              1. 개인정보 수집 및 이용 목적
            </h3>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
              <li>AI 비전 기반 안면 랜드마크(468개 좌표) 분석 및 얼굴형·퍼스널컬러 진단</li>
              <li>맞춤형 헤어스타일 룩북 추천 및 실시간 가상 헤어/컬러 시뮬레이션 제공</li>
              <li>디자이너 맞춤 시술 레시피 생성 및 고객 모바일(카카오 알림톡/SMS) 발송</li>
              <li>살롱 고객 이력 관리 및 다음 방문 시 맞춤 시술 참조</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800">
            <h3 className="font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              2. 수집하는 개인정보 항목
            </h3>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
              <li><strong>필수 항목:</strong> 고객 성명, 안면 촬영 이미지, 얼굴형/퍼스널컬러 분석 데이터</li>
              <li><strong>선택 항목:</strong> 휴대전화번호 (모바일 스타일 레시피 수신용)</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800">
            <h3 className="font-bold text-amber-300 mb-1.5">3. 개인정보 및 안면 이미지 보유·이용 기간</h3>
            <p className="text-[11px] text-zinc-400 mb-2">
              수집된 고객 정보와 분석 데이터는 <strong>살롱 고객 관리 목적으로 최대 1년간 안전하게 보관</strong>되며, 
              고객이 삭제를 요청하는 경우 지체 없이 파기합니다.
            </p>
            <p className="text-[10px] text-zinc-500">
              * 촬영된 원본 안면 이미지는 AI 분석 및 시뮬레이션 처리 후 암호화되어 안전하게 보호됩니다.
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800">
            <h3 className="font-bold text-amber-300 mb-1.5">4. 동의 거부 권리 및 불이익 안내</h3>
            <p className="text-[11px] text-zinc-400">
              귀하는 개인정보 및 민감정보(안면 이미지) 수집·이용에 대한 동의를 거부할 권리가 있습니다. 
              단, 필수 항목에 동의하지 않으실 경우 AI 안면 분석 및 맞춤 스타일 컨설팅 서비스 이용이 제한될 수 있습니다.
            </p>
          </div>

          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800 text-center">
            개인정보 처리자: 유니헤어샵 (033-734-4754 / 강원 원주시 무실로 91)
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-800 shrink-0 flex gap-2.5">
          {onAccept ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-3 text-xs font-bold text-zinc-950 shadow-md hover:brightness-105 transition"
              >
                동의하고 확인 완료
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-3 text-xs font-semibold text-zinc-300 hover:text-white transition"
              >
                닫기
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-zinc-800 hover:bg-zinc-700 py-3 text-xs font-semibold text-zinc-200 transition"
            >
              닫기
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
