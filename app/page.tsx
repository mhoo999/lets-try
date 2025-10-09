'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import HandGuide from './components/HandGuide';
import FingerPills from './components/FingerPills';
import CameraCapture from './components/CameraCapture';
import HandLandmarkDetector from './components/HandLandmarkDetector';
import RingSelectionModal, { Ring, RingColor } from './components/RingSelectionModal';
import ProgressSteps from './components/ProgressSteps';
import html2canvas from 'html2canvas';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1); // 1: 사진촬영, 2: 반지선택, 3: 위치조정&공유
  const [selectedFinger, setSelectedFinger] = useState<string>('thumb'); // 기본값 thumb
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [ringPositions, setRingPositions] = useState<{ finger: string; centerX: number; centerY: number; angle: number; length?: number }[]>([]);
  const [ringSelections, setRingSelections] = useState<{ [finger: string]: { ring: Ring; color: RingColor } }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [lastSelectedRing, setLastSelectedRing] = useState<Ring | null>(null);
  const [lastSelectedColor, setLastSelectedColor] = useState<RingColor | null>(null);
  const handAreaRef = useRef<HTMLDivElement>(null);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // 모바일/PC 환경 감지
  const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 파일 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(undefined);
    const file = e.target.files?.[0];
    if (file) {
      // 파일 타입 검사
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg('jpg, jpeg, png 파일만 업로드할 수 있습니다.');
        return;
      }
      // 용량 검사 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('5MB 이하의 이미지만 업로드할 수 있습니다.');
        return;
      }
      // 해상도 검사
      const img = new window.Image();
      img.onload = () => {
        if (img.width > 3000 || img.height > 3000) {
          setErrorMsg('이미지 해상도는 3000x3000px 이하만 허용됩니다.');
          return;
        }
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        // 사진 업로드 후 Step 1에 머물러서 이미지 확인
      };
      img.onerror = () => {
        setErrorMsg('이미지 파일을 불러올 수 없습니다.');
      };
      img.src = URL.createObjectURL(file);
    }
  };

  // 사진 찍기/업로드 버튼 핸들러
  const handleCameraOrFile = () => {
    if (isMobile) {
      setCameraOpen(true); // 모바일: 카메라 모달
    } else {
      fileInputRef.current?.click(); // PC: 파일 업로드
    }
  };

  // 카메라 촬영 결과 처리
  const handleCameraCapture = (url: string) => {
    setImageUrl(url);
    setCameraOpen(false);
    // 사진 촬영 후 Step 1에 머물러서 이미지 확인
  };

  // FingerPills에서 손가락 선택 시
  const handleFingerSelect = (finger: string) => {
    setSelectedFinger(finger);
    setRingSelections(selected => {
      if (lastSelectedRing && lastSelectedColor) {
        return { [finger]: { ring: lastSelectedRing, color: lastSelectedColor } };
      }
      return { ...selected };
    });
  };

  // 반지 선택 버튼 클릭 시
  const handleOpenRingModal = () => {
    setModalOpen(true);
  };

  // 반지/컬러 선택 후 적용(팝업에서 선택하기 클릭 시)
  const handleRingApply = (ring: Ring, color: RingColor) => {
    const finger = 'thumb'; // 항상 thumb으로 시작
    setSelectedFinger(finger);
    setRingSelections({ [finger]: { ring, color } });
    setLastSelectedRing(ring);
    setLastSelectedColor(color);
    setModalOpen(false);
    // 반지 선택 후 Step 2에 머물러서 손가락 선택
  };

  // rings.json의 모든 반지/컬러 이미지 프리로드
  useEffect(() => {
    fetch('/data/rings.json')
      .then(res => res.json())
      .then((rings: Ring[]) => {
        rings.forEach((ring: Ring) => {
          ring.availableColors.forEach((color: RingColor) => {
            const img = new window.Image();
            img.src = color.imageUrl;
          });
        });
      });
  }, []);

  // 렌더링 직전 상태 확인용 콘솔
  useEffect(() => {
    console.log('ringPositions', ringPositions);
    console.log('ringSelections', ringSelections);
    console.log('selectedFinger', selectedFinger);
  }, [ringPositions, ringSelections, selectedFinger]);

  // html2canvas를 이용한 화면 캡처 및 공유 이미지 생성
  const handleShare = async () => {
    if (!handAreaRef.current) return;
    const canvas = await html2canvas(handAreaRef.current, { backgroundColor: null, useCORS: true });
    const dataUrl = canvas.toDataURL('image/png');
    setShareImageUrl(dataUrl);
    setShowShareModal(true);
  };

  // 이미지 다운로드
  const handleDownload = () => {
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.href = shareImageUrl;
    link.download = `ring-try-on-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 네이티브 공유 기능 (모바일)
  const handleNativeShare = async () => {
    if (!shareImageUrl) return;

    try {
      // dataURL을 Blob으로 변환
      const response = await fetch(shareImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'ring-try-on.png', { type: 'image/png' });

      // Web Share API 지원 여부 확인
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Ring Try-On',
          text: 'Check out my virtual ring try-on!'
        });
      } else {
        // 지원하지 않으면 다운로드
        handleDownload();
      }
    } catch (error) {
      console.error('공유 실패:', error);
      // 실패 시 다운로드
      handleDownload();
    }
  };

  // 인스타그램 공유
  const handleInstagramShare = () => {
    if (!shareImageUrl) return;
    // 인스타그램은 앱을 통한 공유만 지원하므로 이미지 다운로드 후 안내
    handleDownload();
    alert('이미지가 다운로드되었습니다. 인스타그램 앱에서 업로드해주세요.');
  };

  // X(트위터) 공유
  const handleTwitterShare = () => {
    const text = 'Check out my virtual ring try-on! 💍✨';
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  // 하이메 스토어 방문
  const handleVisitStore = () => {
    window.open('https://www.haime.shop/', '_blank');
  };

  // 손가락별 반지 위치 미세 조정값
  const fingerOffsets = {
    thumb: { x: 0, y: 0, angleOffset: 0, sizeMultiplier: 1 },
    index: { x: 0, y: 0, angleOffset: 0, sizeMultiplier: 1 },
    middle: { x: 0, y: 0, angleOffset: 0, sizeMultiplier: 1 },
    ring: { x: 0, y: 0, angleOffset: 0, sizeMultiplier: 1 },
    pinky: { x: 0, y: 0, angleOffset: 0, sizeMultiplier: 1 }
  };

  // 단계별 제목 (설명 제거)
  const stepInfo = {
    1: { title: 'Upload Your Hand Photo' },
    2: { title: 'Choose Your Ring' },
    3: { title: 'Preview & Share' },
  };

  return (
    <main className="w-full h-screen bg-gradient-to-b from-[#fef5f5] to-white flex flex-col overflow-hidden">
      {/* Header with Progress Steps */}
      <div className="flex items-center justify-between px-4 py-3">
        <Header />
        <ProgressSteps currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-3 overflow-y-auto">
        {/* Step Title - Simplified */}
        <h2 className="text-base font-bold text-gray-800 mb-2">{stepInfo[currentStep as keyof typeof stepInfo].title}</h2>

        {/* Image Display Card */}
        <div className="w-full max-w-[300px] mb-3 mx-auto">
          <div ref={handAreaRef} className="w-full aspect-square relative bg-white rounded-2xl shadow-lg overflow-hidden">
              {imageUrl ? (
                <>
                  <HandLandmarkDetector imageUrl={imageUrl} onRingPositions={setRingPositions} />
                  <img id="hand-photo" src={imageUrl} alt="손 사진" style={{ display: 'none' }} />
                  {/* 반지 합성 오버레이 - Step 2 이상에서만 표시 */}
                  {currentStep >= 2 && ringPositions.map((pos) => {
                    if (pos.finger !== selectedFinger) return null;
                    const selection = ringSelections[selectedFinger];
                    if (!selection) return null;

                    // 손가락별 오프셋 가져오기
                    const offset = fingerOffsets[pos.finger as keyof typeof fingerOffsets];

                    // 반지 크기 계산 (손가락별 배율 적용)
                    const base = pos.length
                      ? Math.max(30, Math.min(90, pos.length * 0.7)) * offset.sizeMultiplier
                      : 55 * offset.sizeMultiplier;

                    const style = {
                      position: 'absolute',
                      left: pos.centerX + offset.x,
                      top: pos.centerY + offset.y,
                      width: base,
                      height: 'auto',
                      transform: `translate(-50%,-50%) rotate(${pos.angle + Math.PI / 2 + offset.angleOffset}rad)`,
                      pointerEvents: 'none',
                      zIndex: 10,
                      objectFit: 'contain',
                      borderRadius: '9999px',
                    } as React.CSSProperties;
                    return (
                      <img
                        key={pos.finger}
                        src={selection.color.imageUrl}
                        alt={`${pos.finger} ring`}
                        crossOrigin="anonymous"
                        style={style}
                        onError={() => alert('이미지 로드 실패: ' + selection.color.imageUrl)}
                      />
                    );
                  })}
                </>
              ) : (
                <HandGuide imageUrl={imageUrl} />
              )}
          </div>
        </div>

        {/* Step-specific Controls */}
        {currentStep === 1 && (
          <div className="w-full space-y-2">
            {/* Photo Upload Button */}
            {!imageUrl ? (
              <>
                <button
                  className="w-full h-12 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base shadow-md transition-all"
                  type="button"
                  onClick={handleCameraOrFile}
                >
                  📸 Take a Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {errorMsg && (
                  <div className="text-red-500 text-sm mt-3 text-center bg-red-50 p-2 rounded-lg">{errorMsg}</div>
                )}
              </>
            ) : (
              <>
                {/* Next Button */}
                <button
                  className="w-full h-12 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base shadow-md transition-all"
                  type="button"
                  onClick={() => setCurrentStep(2)}
                >
                  Next: Select Ring →
                </button>
                {/* Retake Photo Button */}
                <button
                  className="w-full h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm transition-all"
                  type="button"
                  onClick={handleCameraOrFile}
                >
                  📸 Retake Photo
                </button>
              </>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="w-full space-y-2">
            {/* Ring Selection Button */}
            <button
              className="w-full h-12 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base shadow-md transition-all"
              type="button"
              onClick={handleOpenRingModal}
            >
              💍 {lastSelectedRing ? 'Change Ring & Color' : 'Choose Ring & Color'}
            </button>

            {/* Selected Ring & Finger Selection */}
            {lastSelectedRing && (
              <>
                <div className="bg-white rounded-xl p-4 shadow-md text-center">
                  <p className="text-xs text-gray-500 mb-1">Selected Ring</p>
                  <p className="text-lg font-bold text-[#d97a7c]">{lastSelectedRing.name}</p>
                </div>

                {/* Finger Selection Card */}
                <div className="bg-white rounded-xl p-3 shadow-md">
                  <FingerPills selected={selectedFinger} onSelect={handleFingerSelect} disabled={false} />
                </div>

                {/* Next Button */}
                <button
                  className="w-full h-12 rounded-full bg-[#595B60] hover:bg-[#44444a] text-white font-semibold text-base shadow-md transition-all"
                  type="button"
                  onClick={() => setCurrentStep(3)}
                >
                  Next: Preview & Share →
                </button>
              </>
            )}

            {/* Back Button */}
            <button
              className="w-full h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm transition-all"
              type="button"
              onClick={() => setCurrentStep(1)}
            >
              ← Back to Photo
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="w-full space-y-2">
            {/* Ring & Finger Info Display */}
            <div className="bg-white rounded-xl p-3 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Ring</span>
                <span className="font-semibold text-gray-800">{lastSelectedRing?.name || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Finger</span>
                <span className="font-semibold text-gray-800 capitalize">{selectedFinger || '-'}</span>
              </div>
            </div>

            {/* Share Button */}
            <button
              className="w-full h-12 rounded-full bg-[#595B60] hover:bg-[#44444a] text-white font-semibold text-base shadow-md transition-all"
              type="button"
              onClick={handleShare}
            >
              📤 Share Image
            </button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                className="flex-1 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm transition-all"
                type="button"
                onClick={() => setCurrentStep(2)}
              >
                ← Edit Selection
              </button>
              <button
                className="flex-1 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm transition-all"
                type="button"
                onClick={() => {
                  setImageUrl(undefined);
                  setSelectedFinger('thumb');
                  setRingSelections({});
                  setLastSelectedRing(null);
                  setLastSelectedColor(null);
                  setCurrentStep(1);
                }}
              >
                🔄 Start Over
              </button>
            </div>
          </div>
        )}
      </div>
      {/* 반지 선택 모달 */}
      <RingSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleRingApply}
      />
      {/* 카메라 모달 */}
      {cameraOpen && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setCameraOpen(false)} />
      )}
      {/* 공유 이미지 팝업(모달) */}
      {showShareModal && shareImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center relative w-full max-w-[400px]">
            <button
              className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowShareModal(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4">Your Ring Try-On</h3>

            <img
              src={shareImageUrl}
              alt="Ring try-on result"
              className="w-full rounded-xl mb-4 shadow-md"
              style={{ maxHeight: 320, objectFit: 'contain' }}
            />

            {/* 공유 버튼 */}
            <div className="w-full space-y-2">
              <button
                className="w-full h-12 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base shadow-md transition-all"
                onClick={handleNativeShare}
              >
                📤 Share
              </button>

              <div className="flex gap-2">
                <button
                  className="flex-1 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-1"
                  onClick={handleInstagramShare}
                >
                  <span className="text-base">📷</span> Instagram
                </button>

                <button
                  className="flex-1 h-10 rounded-full bg-black hover:bg-gray-800 text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-1"
                  onClick={handleTwitterShare}
                >
                  <span className="text-base">𝕏</span> X
                </button>
              </div>

              <button
                className="w-full h-12 rounded-full bg-[#595B60] hover:bg-[#44444a] text-white font-semibold text-base shadow-md transition-all flex items-center justify-center gap-2"
                onClick={handleVisitStore}
              >
                <span className="text-lg">💍</span> Visit Haime Store
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Share your try-on with friends!
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

