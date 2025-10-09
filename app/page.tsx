'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import FingerPills from './components/FingerPills';
import CameraCapture from './components/CameraCapture';
import HandLandmarkDetector from './components/HandLandmarkDetector';
import RingSelectionModal, { Ring, RingColor } from './components/RingSelectionModal';
import ProgressSteps from './components/ProgressSteps';
import StepIndicator from './components/StepIndicator';
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

  // 단계별 제목과 설명
  const stepInfo = {
    1: { title: 'Upload Your Hand Photo', description: 'Take a clear photo of your hand for the best results' },
    2: { title: 'Choose Your Ring', description: 'Select your favorite ring and color' },
    3: { title: 'Adjust & Share', description: 'Choose finger position and share your look' },
  };

  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-[#fef5f5] to-white flex flex-col">
      {/* Header */}
      <div className="pt-4 pb-2">
        <Header />
      </div>

      {/* Progress Steps */}
      <ProgressSteps currentStep={currentStep} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-6">
        {/* Step Indicator */}
        <StepIndicator
          step={currentStep}
          title={stepInfo[currentStep as keyof typeof stepInfo].title}
          description={stepInfo[currentStep as keyof typeof stepInfo].description}
        />

        {/* Image Display Card - Show when image is uploaded */}
        {imageUrl && (
          <div className="w-full max-w-md mb-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div ref={handAreaRef} className="w-full aspect-square relative bg-[#f5f5f5]">
                <HandLandmarkDetector imageUrl={imageUrl} onRingPositions={setRingPositions} />
                <img id="hand-photo" src={imageUrl} alt="손 사진" style={{ display: 'none' }} />
                {/* 반지 합성 오버레이 - Step 2 이상에서만 표시 */}
                {currentStep >= 2 && ringPositions.map((pos) => {
                  if (pos.finger !== selectedFinger) return null;
                  const selection = ringSelections[selectedFinger];
                  if (!selection) return null;
                  const base = pos.length ? Math.max(30, Math.min(90, pos.length * 0.7)) : 55;
                  const style = {
                    position: 'absolute',
                    left: pos.centerX,
                    top: pos.centerY,
                    width: base,
                    height: 'auto',
                    transform: `translate(-50%,-50%) rotate(${pos.angle + Math.PI / 2}rad)`,
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
              </div>
            </div>
          </div>
        )}

        {/* Step-specific Controls */}
        {currentStep === 1 && (
          <div className="w-full max-w-md space-y-4">
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
          <div className="w-full max-w-md space-y-4">
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
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose Finger Position</h3>
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
          <div className="w-full max-w-md space-y-4">
            {/* Ring & Finger Info Display */}
            <div className="bg-white rounded-xl p-4 shadow-md">
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
            <div className="flex gap-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center relative w-[90vw] max-w-[400px]">
            <button className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-600" onClick={() => setShowShareModal(false)}>×</button>
            <div className="mb-2 font-bold text-lg">완성된 이미지</div>
            <img src={shareImageUrl} alt="공유 이미지 미리보기" className="w-full rounded-xl mb-4" style={{ maxHeight: 320, objectFit: 'contain' }} />
            <div className="text-xs text-gray-500 mt-2 text-center">
              모바일에서는 이미지를 <b>길게 눌러 사진에 저장</b>하거나,<br />
              <b>공유 버튼</b>을 이용해 사진첩에 저장할 수 있습니다.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

