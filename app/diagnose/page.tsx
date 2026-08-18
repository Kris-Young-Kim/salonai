'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CameraView } from '@/components/camera/CameraView';
import { DiagnosisScanner } from '@/components/diagnosis/DiagnosisScanner';
import { FaceMeshVisualizer } from '@/components/diagnosis/FaceMeshVisualizer';
import { FaceShapeReport } from '@/components/diagnosis/FaceShapeReport';
import { PersonalColorReport } from '@/components/diagnosis/PersonalColorReport';
import { LookbookGallery } from '@/components/lookbook/LookbookGallery';
import { DesignerNotesEditor } from '@/components/prescription/DesignerNotesEditor';
import { PrescriptionSuccessModal } from '@/components/prescription/PrescriptionSuccessModal';
import { VirtualHairSimulator } from '@/components/simulation/VirtualHairSimulator';
import { RealtimeHairFitting } from '@/components/simulation/RealtimeHairFitting';
import { HairDyeRecommendation } from '@/components/prescription/HairDyeRecommendation';
import { getRecommendedDyes } from '@/lib/data/hairDyeChart';
import { detectFaceMesh } from '@/lib/ai/faceMeshService';
import { extractSkinColorFromImage } from '@/lib/ai/skinSampling';
import { analyzePersonalColor } from '@/lib/ai/personalColor';
import { matchLookbooks } from '@/lib/ai/lookbookMatcher';
import { CapturedImage, CustomerQuickMeta } from '@/types/camera';
import { FaceAnalysisResult } from '@/types/diagnosis';
import { PersonalColorResult } from '@/types/personalColor';
import { MatchedLookbookItem } from '@/types/lookbook';
import {
  ArrowLeft,
  Sparkles,
  Check,
  ChevronRight,
  Scissors,
  Palette,
  Layers,
  RefreshCw,
  Phone,
  Send,
  Wand2,
} from 'lucide-react';

export default function DiagnosePage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeReportTab, setActiveReportTab] = useState<'faceShape' | 'personalColor'>('faceShape');
  const [step3SubTab, setStep3SubTab] = useState<'gallery' | 'fitting' | 'simulation'>('gallery');

  // Customer & Capture State
  const [capturedData, setCapturedData] = useState<{
    image: CapturedImage;
    customerMeta: CustomerQuickMeta;
  } | null>(null);

  // Diagnosis State
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysisResult | null>(null);
  const [personalColor, setPersonalColor] = useState<PersonalColorResult | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<MatchedLookbookItem[]>([]);

  // Step 4 Prescription State
  const [customerPhone, setCustomerPhone] = useState('010-1234-5678');
  const [hairCondition, setHairCondition] = useState('보통모');
  const [designerNotes, setDesignerNotes] = useState(
    '• 모질 분석: 보통 굵기의 건강모\n• 맞춤 처방: 턱선을 보정하는 레이어드 디자인과 피부 톤을 화사하게 정돈하는 컬러 조합을 추천합니다.'
  );

  const [synthesizedImageUrl, setSynthesizedImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [targetedPieceId, setTargetedPieceId] = useState<string | undefined>(undefined);
  const [targetedPieceVersion, setTargetedPieceVersion] = useState(0);
  const [targetedStyle, setTargetedStyle] = useState<MatchedLookbookItem | null>(null);
  const [targetedStyleVersion, setTargetedStyleVersion] = useState(0);
  const [successModalData, setSuccessModalData] = useState<{
    token: string;
    url: string;
  } | null>(null);

  // Calculate matched lookbooks when diagnosis is ready
  const matchedLookbooks = useMemo(() => {
    if (!faceAnalysis || !personalColor || !capturedData) return [];
    return matchLookbooks({
      faceAnalysis,
      personalColor,
      customerMeta: capturedData.customerMeta,
    });
  }, [faceAnalysis, personalColor, capturedData]);

  // When Step 1 (Camera capture) is confirmed
  const handleCaptureComplete = async (image: CapturedImage, customerMeta: CustomerQuickMeta) => {
    setCapturedData({ image, customerMeta });
    setIsAnalyzing(true);
    setCurrentStep(2);

    try {
      const faceResult = await detectFaceMesh(image.dataUrl);

      let skinAvg = { r: 210, g: 170, b: 140 };
      try {
        const skinSample = await extractSkinColorFromImage(image.dataUrl, faceResult.landmarks);
        skinAvg = skinSample.combinedAverage;
      } catch (skinErr) {
        console.warn('Skin sampling fallback (default warm tone):', skinErr);
      }

      const colorResult = analyzePersonalColor(skinAvg);

      setTimeout(() => {
        setFaceAnalysis(faceResult);
        setPersonalColor(colorResult);
        setIsAnalyzing(false);
      }, 1500);
    } catch (err) {
      console.error('Diagnosis analysis error:', err);
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedData(null);
    setFaceAnalysis(null);
    setPersonalColor(null);
    setSelectedStyles([]);
    setSynthesizedImageUrl(null);
    setSuccessModalData(null);
    setStep3SubTab('gallery');
    setTargetedPieceId(undefined);
    setTargetedStyle(null);
    setCurrentStep(1);
  };

  const handleProceedToLookbook = () => {
    setCurrentStep(3);
  };

  const handleProceedToPrescription = (styles: MatchedLookbookItem[]) => {
    setSelectedStyles(styles);
    setCurrentStep(4);
  };

  // Quick Action: 0.1s Realtime Fitting trigger from Lookbook
  const handleQuickFit = (item: MatchedLookbookItem) => {
    const isMale = item.id.startsWith('lb-m') || capturedData?.customerMeta.gender === 'male';
    const pieceMap: Record<string, string> = {
      'lb-f-01': 'vh-f-layered-c',
      'lb-f-02': 'vh-f-hershey',
      'lb-f-03': 'vh-f-build-perm',
      'lb-f-04': 'vh-f-tassel-bob',
      'lb-f-06': 'vh-f-hippie',
      'lb-m-01': 'vh-m-dandy',
      'lb-m-02': 'vh-m-guile',
      'lb-m-03': 'vh-m-as-perm',
      'lb-m-04': 'vh-m-ivy',
    };
    setTargetedPieceId(pieceMap[item.id] || (isMale ? 'vh-m-guile' : 'vh-f-layered-c'));
    setTargetedPieceVersion((v) => v + 1);
    setStep3SubTab('fitting');
  };

  // Quick Action: AI Simulation trigger from Lookbook
  const handleQuickSimulate = (item: MatchedLookbookItem) => {
    setSelectedStyles((prev) => (prev.some((s) => s.id === item.id) ? prev : [item, ...prev]));
    setTargetedStyle(item);
    setTargetedStyleVersion((v) => v + 1);
    setStep3SubTab('simulation');
  };

  // Execute Save to Neon DB & Send KakaoTalk Alimtalk
  const handleSaveAndSendPrescription = async () => {
    if (!capturedData || !faceAnalysis || !personalColor) return;

    setIsSaving(true);

    try {
      const styleTags = [
        `#${faceAnalysis.faceShapeKorean.split(' ')[0]}`,
        `#${personalColor.seasonKorean.split(' ')[0]}`,
        ...selectedStyles.map((s) => s.styleName),
      ];

      // 1. Save Diagnosis to Neon DB
      const res = await fetch('/api/diagnoses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: capturedData.customerMeta.name,
          customerPhone: customerPhone,
          originalImageUrl: capturedData.image.dataUrl,
          faceShape: faceAnalysis.faceShapeKorean,
          faceRatio: faceAnalysis.facialThirds,
          personalColor: personalColor.seasonKorean,
          skinHexColor: personalColor.skinTone.hex,
          selectedStyleTags: styleTags,
          designerNotes: `[모질: ${hairCondition}]\n${designerNotes}`,
          synthesizedImageUrl: synthesizedImageUrl ?? undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.prescriptionToken) {
        // 2. Send KakaoTalk Simulation
        await fetch('/api/prescriptions/send-kakao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: capturedData.customerMeta.name,
            customerPhone: customerPhone,
            prescriptionUrl: data.prescriptionUrl,
            summary: `${faceAnalysis.faceShapeKorean} • ${personalColor.seasonKorean}`,
          }),
        });

        // 3. Open Success Modal
        setSuccessModalData({
          token: data.prescriptionToken,
          url: data.prescriptionUrl,
        });
      } else {
        alert(data.error || '진단 저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Save diagnosis error:', err);
      alert('맞춤 레시피 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { num: 1, label: '고객 촬영', desc: '정면 가이드라인 촬영' },
    { num: 2, label: 'AI 정밀 진단', desc: '얼굴형 & 퍼스널컬러' },
    { num: 3, label: '룩북 & 시뮬레이션', desc: '맞춤 매칭 및 전후비교' },
    { num: 4, label: '스타일 레시피', desc: '리포트 저장 & 알림톡 발송' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-zinc-950 text-white overflow-hidden">
      
      {/* Salon Diagnosis Step Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-4 sm:px-8 py-3 backdrop-blur-md z-20 shrink-0">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-amber-400">
                유니헤어샵 스타일 컨설팅
              </span>
              <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/20">
                {currentStep === 1 ? '1단계 촬영' : currentStep === 2 ? '2단계 AI 스타일 분석' : currentStep === 3 ? '3단계 룩북 & 시뮬레이션' : '4단계 맞춤 레시피'}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-100">
              1분 스마트 헤어 컨설팅
            </h1>
          </div>
        </div>

        {/* Center / Right: Step Progress Indicator */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {steps.map((s, idx) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            const isClickable = s.num === 1 || (Boolean(capturedData) && s.num <= (faceAnalysis ? 4 : 2));

            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && setCurrentStep(s.num)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 transition cursor-pointer disabled:cursor-not-allowed ${
                    isActive
                      ? 'bg-amber-400/15 border border-amber-400/40 text-amber-300'
                      : isDone
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                      : 'text-zinc-600 opacity-60'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      isActive
                        ? 'bg-amber-400 text-zinc-950'
                        : isDone
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : s.num}
                  </div>
                  <span className="text-xs font-semibold">{s.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
                )}
              </React.Fragment>
            );
          })}
        </div>

      </div>

      {/* Main Horizontal Slide Workflow Container */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${(currentStep - 1) * 100}%)` }}
        >
          {/* ─── Slide 1: Camera UI (FR-101) ─── */}
          <div className="w-full h-full shrink-0 overflow-hidden relative">
            <CameraView onCaptureComplete={handleCaptureComplete} />
          </div>

          {/* ─── Slide 2: AI Face Mesh (FR-102) & Personal Color (FR-103) ─── */}
          <div className="w-full h-full shrink-0 overflow-y-auto no-scrollbar relative p-4 sm:p-6 lg:p-8">
            {isAnalyzing && capturedData && (
              <DiagnosisScanner customerName={capturedData.customerMeta.name} />
            )}

            {!isAnalyzing && faceAnalysis && personalColor && capturedData && (
              <div className="mx-auto max-w-7xl h-full flex flex-col justify-between space-y-6">
                
                {/* Top: Tab Switcher & Next CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
                  <div className="flex rounded-2xl bg-zinc-900 p-1.5 border border-zinc-800 shadow-lg">
                    <button
                      type="button"
                      onClick={() => setActiveReportTab('faceShape')}
                      className={`flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2 text-xs font-bold transition ${
                        activeReportTab === 'faceShape'
                          ? 'bg-amber-400 text-zinc-950 shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                      <span>얼굴형 & 두상 분석</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveReportTab('personalColor')}
                      className={`flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2 text-xs font-bold transition ${
                        activeReportTab === 'personalColor'
                          ? 'bg-amber-400 text-zinc-950 shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Palette className="h-4 w-4" />
                      <span>피부톤 & 퍼스널 컬러</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToLookbook}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-6 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg hover:brightness-105 transition active:scale-95"
                  >
                    <span>맞춤 룩북 추천 보기</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Main 2-Column Split View for Tablet Landscape */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
                  {/* Left Column (5 cols): 3D Mesh & Skin ROI Visualizer */}
                  <div className="lg:col-span-5 flex flex-col h-[480px] sm:h-[560px] lg:h-[600px]">
                    <FaceMeshVisualizer
                      imageUrl={capturedData.image.dataUrl}
                      analysis={faceAnalysis}
                      personalColor={personalColor}
                    />
                  </div>

                  {/* Right Column (7 cols): Selected Diagnosis Tab Report */}
                  <div className="lg:col-span-7">
                    {activeReportTab === 'faceShape' && (
                      <FaceShapeReport
                        analysis={faceAnalysis}
                        customerMeta={capturedData.customerMeta}
                        onProceedToLookbook={handleProceedToLookbook}
                        onRetake={handleRetake}
                      />
                    )}

                    {activeReportTab === 'personalColor' && (
                      <PersonalColorReport
                        personalColor={personalColor}
                        customerMeta={capturedData.customerMeta}
                        onProceedToLookbook={handleProceedToLookbook}
                        onRetake={handleRetake}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Slide 3: Lookbook Recommendation & Virtual Simulator ─── */}
          <div className="w-full h-full shrink-0 overflow-y-auto no-scrollbar relative p-4 sm:p-6 lg:p-8">
            {capturedData && faceAnalysis && personalColor && (
              <div className="max-w-7xl mx-auto space-y-6 pb-20">
                
                {/* Step 3 SubTab Switcher */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
                  <div className="flex flex-wrap items-center rounded-2xl bg-zinc-900 p-1.5 border border-zinc-800 shadow-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setStep3SubTab('gallery')}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                        step3SubTab === 'gallery'
                          ? 'bg-amber-400 text-zinc-950 shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Scissors className="h-4 w-4" />
                      <span>맞춤 룩북 갤러리</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep3SubTab('fitting')}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                        step3SubTab === 'fitting'
                          ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-zinc-950 shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>0.1초 실시간 헤어 피팅</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep3SubTab('simulation')}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                        step3SubTab === 'simulation'
                          ? 'bg-amber-400 text-zinc-950 shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>AI 정밀 시뮬레이터</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
                    >
                      ← 진단 결과
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-5 py-2 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg hover:brightness-105 transition"
                    >
                      <span>처방전 작성</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {step3SubTab === 'gallery' && (
                  <LookbookGallery
                    matchedLookbooks={matchedLookbooks}
                    faceAnalysis={faceAnalysis}
                    personalColor={personalColor}
                    customerMeta={capturedData.customerMeta}
                    onProceedToPrescription={handleProceedToPrescription}
                    onQuickFit={handleQuickFit}
                    onQuickSimulate={handleQuickSimulate}
                  />
                )}

                {step3SubTab === 'fitting' && (
                  <div className="space-y-6 max-w-5xl mx-auto pb-12">
                    <RealtimeHairFitting
                      originalImageUrl={capturedData.image.dataUrl}
                      landmarks={faceAnalysis.landmarks.map((p) => ({
                        x: p.x / capturedData.image.width,
                        y: p.y / capturedData.image.height,
                        z: p.z,
                      }))}
                      defaultGender={capturedData.customerMeta.gender}
                      initialPieceId={targetedPieceId}
                      initialPieceVersion={targetedPieceVersion}
                    />
                  </div>
                )}

                {step3SubTab === 'simulation' && (
                  <div className="space-y-6 max-w-5xl mx-auto pb-12">
                    <VirtualHairSimulator
                      originalImageUrl={capturedData.image.dataUrl}
                      selectedStyles={selectedStyles.length > 0 ? selectedStyles : matchedLookbooks.slice(0, 3)}
                      personalColorHex={personalColor.skinTone.hex}
                      initialStyle={targetedStyle}
                      initialStyleVersion={targetedStyleVersion}
                      onSynthesized={setSynthesizedImageUrl}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Slide 4: Comprehensive Consultation Report & Prescription Issuer ─── */}
          <div className="w-full h-full shrink-0 overflow-y-auto no-scrollbar relative p-4 sm:p-6 lg:p-8">
            {capturedData && faceAnalysis && personalColor && (
              <div className="max-w-6xl mx-auto space-y-6 pb-24">
                
                {/* Top Banner */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/20 mb-1 inline-block break-keep">
                      Step 04 • 전문가 종합 상담 & 맞춤 스타일 레시피 발행
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white break-keep">
                      [{capturedData.customerMeta.name}] 고객님 맞춤 스타일 레시피
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition whitespace-nowrap"
                  >
                    ← 스타일 다시 선택
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Diagnosis Summary & Selected Styles (6 cols) */}
                  <div className="lg:col-span-6 space-y-5">
                    
                    {/* Visual Snapshot Card */}
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-md">
                      <div className="flex items-center gap-4 mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={capturedData.image.dataUrl}
                          alt="촬영 사진"
                          className="h-20 w-16 rounded-2xl object-cover border border-amber-400/40 shadow-md"
                        />
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {capturedData.customerMeta.name} 고객님
                          </h3>
                          <p className="text-xs text-amber-300 font-semibold mt-0.5">
                            {faceAnalysis.faceShapeKorean} • {personalColor.seasonKorean}
                          </p>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            피부톤 {personalColor.skinTone.hex} ({personalColor.skinTone.brightnessKorean})
                          </span>
                        </div>
                      </div>

                      {/* 3단 안부 지표 요약 */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-zinc-950 p-2 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block">상안부</span>
                          <span className="font-bold text-amber-200">{faceAnalysis.facialThirds.upperRatio}</span>
                        </div>
                        <div className="rounded-xl bg-zinc-950 p-2 border border-amber-400/30">
                          <span className="text-[10px] text-amber-300 block">중안부</span>
                          <span className="font-bold text-amber-400">{faceAnalysis.facialThirds.middleRatio}</span>
                        </div>
                        <div className="rounded-xl bg-zinc-950 p-2 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block">하안부</span>
                          <span className="font-bold text-yellow-400">{faceAnalysis.facialThirds.lowerRatio}</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Styles List */}
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-md">
                      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Scissors className="h-4 w-4 text-amber-400" />
                        선택된 시술 스타일 ({selectedStyles.length}건)
                      </h4>

                      {selectedStyles.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic p-3 bg-zinc-950 rounded-2xl">
                          선택된 스타일이 없습니다. 이전 단계에서 원하는 스타일을 선택하세요.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {selectedStyles.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between rounded-2xl bg-zinc-950 p-3 border border-zinc-800"
                            >
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={s.imageUrl} alt={s.styleName} className="h-11 w-11 rounded-xl object-cover" />
                                <div>
                                  <span className="text-xs font-bold text-zinc-100 block">{s.styleName}</span>
                                  <span className="text-[10px] text-amber-400 font-semibold">{s.matchScore}% 매칭</span>
                                </div>
                              </div>
                              <span className="text-xs text-zinc-400 font-mono">{s.timeEstimate || '1시간 30분'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hair Dye Formula Recommendation (FR-302) */}
                    <HairDyeRecommendation
                      tints={getRecommendedDyes(personalColor.season)}
                    />
                  </div>

                  {/* Right Column: Designer Notes & Kakao Dispatch Form (6 cols) */}
                  <div className="lg:col-span-6 space-y-5">
                    {/* Designer Notes Editor (FR-203) */}
                    <DesignerNotesEditor
                      initialNotes={designerNotes}
                      onChange={setDesignerNotes}
                      hairCondition={hairCondition}
                      onHairConditionChange={setHairCondition}
                    />

                    {/* Customer Phone for Kakao Dispatch */}
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-md space-y-3">
                      <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-amber-400" />
                        고객 카카오톡 알림톡 수신 번호
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className="w-full rounded-2xl bg-zinc-950 border border-zinc-700/80 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none transition font-mono"
                      />
                      <p className="text-[11px] text-zinc-500">
                        발행 즉시 고객님 스마트폰으로 맞춤 헤어 레시피 리포트 웹 링크가 전송됩니다.
                      </p>
                    </div>

                    {/* Final Submit & Send Button */}
                    <button
                      type="button"
                      onClick={handleSaveAndSendPrescription}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-4 text-sm font-bold text-zinc-950 shadow-[0_0_30px_rgba(245,208,97,0.4)] hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>Neon DB 저장 및 알림톡 전송 중...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 text-zinc-950" />
                          <span>진단 저장 & 카카오톡 스타일 레시피 발송</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModalData && capturedData && (
        <PrescriptionSuccessModal
          isOpen={Boolean(successModalData)}
          onClose={() => setSuccessModalData(null)}
          customerName={capturedData.customerMeta.name}
          customerPhone={customerPhone}
          prescriptionToken={successModalData.token}
          prescriptionUrl={successModalData.url}
          onResetDiagnosis={handleRetake}
        />
      )}

    </div>
  );
}
