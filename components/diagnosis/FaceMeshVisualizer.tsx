'use client';

import React, { useRef, useEffect, useState } from 'react';
import { FaceAnalysisResult } from '@/types/diagnosis';
import { PersonalColorResult } from '@/types/personalColor';
import { Layers, Eye, Grid, Maximize2, Pipette } from 'lucide-react';

interface FaceMeshVisualizerProps {
  imageUrl: string;
  analysis: FaceAnalysisResult;
  personalColor?: PersonalColorResult | null;
}

export function FaceMeshVisualizer({ imageUrl, analysis, personalColor }: FaceMeshVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showMesh, setShowMesh] = useState(true);
  const [showThirds, setShowThirds] = useState(true);
  const [showWidths, setShowWidths] = useState(true);
  const [showSkinROI, setShowSkinROI] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'proportions' | 'personalColor' | 'mesh' | 'clean'>('all');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.naturalWidth || 1080;
      canvas.height = img.naturalHeight || 1440;

      // Draw background customer image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Extract Landmark points
      const points = analysis.landmarks;
      if (!points || points.length === 0) return;

      const pForehead = points[10];
      const pGlabella = points[9] || points[168];
      const pSubnasale = points[2];
      const pMenton = points[152];

      const pCheekLeft = points[234];
      const pCheekRight = points[454];

      const pForeheadLeft = points[54];
      const pForeheadRight = points[284];

      const pJawLeft = points[58] || points[132];
      const pJawRight = points[288] || points[361];

      // Skin ROI Sampling Points
      const pSkinForehead = points[151] || points[9];
      const pSkinLeftCheek = points[118] || points[117];
      const pSkinRightCheek = points[347] || points[346];

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw 468 Mesh Points & Connections
      if (showMesh && activeTab !== 'clean' && activeTab !== 'personalColor') {
        const faceOvalIndices = [
          10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
          400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
          54, 103, 67, 109, 10
        ];

        ctx.strokeStyle = 'rgba(245, 208, 97, 0.75)';
        ctx.lineWidth = Math.max(2, w * 0.003);
        ctx.beginPath();
        faceOvalIndices.forEach((idx, i) => {
          const pt = points[idx];
          if (pt) {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
        });
        ctx.closePath();
        ctx.stroke();

        // Draw individual mesh landmarks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        points.forEach((p, idx) => {
          const isKey = [10, 9, 2, 152, 234, 454, 54, 284, 58, 288].includes(idx);
          if (isKey) {
            ctx.fillStyle = '#F5D061';
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(4, w * 0.006), 0, Math.PI * 2);
            ctx.fill();
          } else if (idx % 2 === 0) {
            ctx.fillStyle = 'rgba(245, 208, 97, 0.4)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1.5, w * 0.002), 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 2. Draw Facial Thirds (상/중/하안부)
      if (showThirds && (activeTab === 'all' || activeTab === 'proportions')) {
        const lineOffsetLeft = w * 0.15;
        const lineOffsetRight = w * 0.85;

        // Hairline
        drawMeasureLine(ctx, lineOffsetLeft, pForehead.y, lineOffsetRight, pForehead.y, '헤어라인 (상안부)', '#E2E8F0', w);
        // Glabella
        drawMeasureLine(ctx, lineOffsetLeft, pGlabella.y, lineOffsetRight, pGlabella.y, '미간/눈썹 (중안부)', '#F5D061', w);
        // Subnasale
        drawMeasureLine(ctx, lineOffsetLeft, pSubnasale.y, lineOffsetRight, pSubnasale.y, '코끝선 (하안부)', '#F5D061', w);
        // Menton
        drawMeasureLine(ctx, lineOffsetLeft, pMenton.y, lineOffsetRight, pMenton.y, '턱끝선', '#E2E8F0', w);

        // Vertical Ratio Markers on Right
        const rightX = lineOffsetRight + w * 0.04;
        drawRatioBracket(ctx, rightX, pForehead.y, pGlabella.y, `상안부 ${analysis.facialThirds.upperPercent}%`, w);
        drawRatioBracket(ctx, rightX, pGlabella.y, pSubnasale.y, `중안부 ${analysis.facialThirds.middlePercent}%`, w);
        drawRatioBracket(ctx, rightX, pSubnasale.y, pMenton.y, `하안부 ${analysis.facialThirds.lowerPercent}%`, w);
      }

      // 3. Draw Width Indicators
      if (showWidths && (activeTab === 'all' || activeTab === 'proportions')) {
        drawWidthArrow(ctx, pCheekLeft.x, pCheekLeft.y, pCheekRight.x, pCheekRight.y, `광대폭`, '#38BDF8', w);
        drawWidthArrow(ctx, pForeheadLeft.x, pForeheadLeft.y, pForeheadRight.x, pForeheadRight.y, `이마폭`, '#A855F7', w);
        drawWidthArrow(ctx, pJawLeft.x, pJawLeft.y, pJawRight.x, pJawRight.y, `턱선폭`, '#EC4899', w);
      }

      // 4. Draw Skin Tone ROI Sampling Targets
      if (showSkinROI && (activeTab === 'all' || activeTab === 'personalColor') && personalColor) {
        const hex = personalColor.skinTone.hex;
        drawSkinTarget(ctx, pSkinForehead.x, pSkinForehead.y, '이마 ROI', hex, w);
        drawSkinTarget(ctx, pSkinLeftCheek.x, pSkinLeftCheek.y, '좌측 볼 ROI', hex, w);
        drawSkinTarget(ctx, pSkinRightCheek.x, pSkinRightCheek.y, '우측 볼 ROI', hex, w);
      }
    };
  }, [imageUrl, analysis, personalColor, showMesh, showThirds, showWidths, showSkinROI, activeTab]);

  return (
    <div className="flex flex-col w-full h-full bg-zinc-900/60 rounded-3xl border border-zinc-800 p-4 sm:p-5 backdrop-blur-md">
      
      {/* Top Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-zinc-800">
        <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-amber-400" />
          3D 랜드마크 & 피부 분석 뷰어
        </span>

        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setShowMesh(true);
              setShowThirds(true);
              setShowWidths(true);
              setShowSkinROI(true);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activeTab === 'all' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            전체 오버레이
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('proportions');
              setShowMesh(false);
              setShowThirds(true);
              setShowWidths(true);
              setShowSkinROI(false);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activeTab === 'proportions' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            안부 비율
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('personalColor');
              setShowMesh(false);
              setShowThirds(false);
              setShowWidths(false);
              setShowSkinROI(true);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activeTab === 'personalColor' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            피부 ROI
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('clean');
              setShowMesh(false);
              setShowThirds(false);
              setShowWidths(false);
              setShowSkinROI(false);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activeTab === 'clean' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            원본 사진
          </button>
        </div>
      </div>

      {/* Main Visualizer Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center bg-black rounded-2xl overflow-hidden shadow-inner border border-zinc-800/80 min-h-[360px]"
      >
        <canvas
          ref={canvasRef}
          className="max-h-full max-w-full object-contain rounded-xl"
        />

        {/* Legend Badge */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 pointer-events-none">
          <div className="rounded-lg bg-black/75 px-2.5 py-1 text-[10px] font-medium text-amber-300 backdrop-blur-md border border-amber-400/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            황금비율 기준선
          </div>
          {personalColor && (
            <div className="rounded-lg bg-black/75 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/40 inline-block"
                style={{ backgroundColor: personalColor.skinTone.hex }}
              />
              피부톤 {personalColor.skinTone.hex}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// Canvas Drawing Helpers
function drawMeasureLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  color: string,
  baseWidth: number
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, baseWidth * 0.002);
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.setLineDash([]);
  const fontSize = Math.max(12, Math.round(baseWidth * 0.022));
  ctx.font = `600 ${fontSize}px Pretendard, sans-serif`;
  const textWidth = ctx.measureText(label).width;

  ctx.fillRect(x1 - textWidth - 10, y1 - fontSize / 2 - 4, textWidth + 8, fontSize + 8);
  ctx.fillStyle = color;
  ctx.fillText(label, x1 - textWidth - 6, y1 + fontSize / 3);
  ctx.restore();
}

function drawRatioBracket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y1: number,
  y2: number,
  text: string,
  baseWidth: number
) {
  ctx.save();
  const midY = (y1 + y2) / 2;
  const bracketW = Math.max(8, baseWidth * 0.015);

  ctx.strokeStyle = '#F5D061';
  ctx.lineWidth = Math.max(1.5, baseWidth * 0.002);
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x + bracketW, y1);
  ctx.lineTo(x + bracketW, y2);
  ctx.lineTo(x, y2);
  ctx.stroke();

  const fontSize = Math.max(11, Math.round(baseWidth * 0.02));
  ctx.font = `bold ${fontSize}px Pretendard, sans-serif`;
  ctx.fillStyle = '#F5D061';
  ctx.fillText(text, x + bracketW + 6, midY + fontSize / 3);
  ctx.restore();
}

function drawWidthArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  color: string,
  baseWidth: number
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, baseWidth * 0.002);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const r = Math.max(3, baseWidth * 0.004);
  ctx.beginPath();
  ctx.arc(x1, y1, r, 0, Math.PI * 2);
  ctx.arc(x2, y2, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSkinTarget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  colorHex: string,
  baseWidth: number
) {
  ctx.save();
  const r = Math.max(12, baseWidth * 0.018);

  // Outer glowing pulse ring
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Color fill center
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.arc(x, y, r - 3, 0, Math.PI * 2);
  ctx.fill();

  // Target Crosshairs
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - r - 4, y);
  ctx.lineTo(x + r + 4, y);
  ctx.moveTo(x, y - r - 4);
  ctx.lineTo(x, y + r + 4);
  ctx.stroke();

  // Tag Badge below
  const fontSize = Math.max(10, Math.round(baseWidth * 0.016));
  ctx.font = `600 ${fontSize}px Pretendard, sans-serif`;
  const textWidth = ctx.measureText(label).width;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x - textWidth / 2 - 4, y + r + 4, textWidth + 8, fontSize + 6);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(label, x - textWidth / 2, y + r + fontSize + 2);

  ctx.restore();
}
