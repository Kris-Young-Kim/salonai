'use client';

import React, { useState } from 'react';
import { Edit3, Sparkles, Plus, CheckCircle2 } from 'lucide-react';

interface DesignerNotesEditorProps {
  initialNotes: string;
  onChange: (notes: string) => void;
  hairCondition: string;
  onHairConditionChange: (condition: string) => void;
}

export function DesignerNotesEditor({
  initialNotes,
  onChange,
  hairCondition,
  onHairConditionChange,
}: DesignerNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    onChange(val);
  };

  const templates = [
    {
      label: '+ 애쉬 염색 레시피',
      text: '• 사용 레시피: 8-Level 쿨 애쉬 브라운 + 6% 산화제 (1:1.5)\n• 방치 시간: 25분 자연 방치\n• 추천 홈케어: 보색 샴푸 주 2회 사용',
    },
    {
      label: '+ C컬 볼륨펌 가이드',
      text: '• 시술 내용: 모발 끝부분 디지털 20호 C컬 와인딩 + 뿌리 아이롱 볼륨\n• 손질법: 안쪽에서 바깥쪽으로 가볍게 털어 말리기\n• 홈케어: 수분 컬 크림 도포',
    },
    {
      label: '+ 손상모 케어 안내',
      text: '• 모질 상태: 잦은 시술로 인한 단백질 손실\n• 권장 케어: 단백질 헤어팩 주 1회 집중 영양 공급 및 열 보호 에센스 필수',
    },
  ];

  const insertTemplate = (text: string) => {
    const next = notes ? `${notes}\n\n${text}` : text;
    handleNotesChange(next);
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 backdrop-blur-md text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <Edit3 className="h-4 w-4 text-amber-400" />
          디자이너 시술 메모 & 홈케어 레시피
        </h3>
        <span className="text-[11px] text-zinc-500 font-medium">고객 맞춤 레시피에 함께 표기됩니다</span>
      </div>

      {/* Hair Condition Quick Selector */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-zinc-400 block mb-2">고객 모질 및 손상도</label>
        <div className="flex flex-wrap gap-2">
          {['건강모', '보통모', '극손상모', '탈색모', '곱슬모', '가는 연모'].map((cond) => (
            <button
              key={cond}
              type="button"
              onClick={() => onHairConditionChange(cond)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition border ${
                hairCondition === cond
                  ? 'bg-amber-400 text-zinc-950 border-amber-300 font-bold shadow-md'
                  : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Template Pills */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-zinc-400 block mb-1.5">스마트 템플릿 추가</label>
        <div className="flex flex-wrap gap-2">
          {templates.map((tpl) => (
            <button
              key={tpl.label}
              type="button"
              onClick={() => insertTemplate(tpl.text)}
              className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-zinc-700 hover:text-white transition border border-zinc-700/60"
            >
              <Plus className="h-3 w-3" />
              <span>{tpl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Textarea */}
      <textarea
        rows={4}
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        placeholder="디자이너 특이사항, 사용한 약제 번호, 홈케어 주의사항을 자유롭게 작성하세요..."
        className="w-full rounded-2xl bg-zinc-950/90 border border-zinc-800 p-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition leading-relaxed font-sans"
      />
    </div>
  );
}
