'use client';

import React, { useState, useRef } from 'react';
import Header from './components/Header';
import HandGuide from './components/HandGuide';
import FingerPills from './components/FingerPills';
import CameraCapture from './components/CameraCapture';
import HandLandmarkDetector from './components/HandLandmarkDetector';
import RingSelectionModal from './components/RingSelectionModal';

export default function Home() {
  const [selectedFinger, setSelectedFinger] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [ringPositions, setRingPositions] = useState<{ finger: string; centerX: number; centerY: number; angle: number }[]>([]);
  const [ringSelections, setRingSelections] = useState<{ [finger: string]: { ring: any; color: any } }>({});
  const [modalOpen, setModalOpen] = useState(false);

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
  };

  // FingerPills에서 손가락 선택 시
  const handleFingerSelect = (finger: string) => {
    setSelectedFinger(finger);
    setModalOpen(true); // 손가락 pill 클릭 시 팝업 오픈
  };

  // 반지/컬러 선택 시
  const handleRingSelect = (ring: any, color: any) => {
    if (selectedFinger) {
      setRingSelections((prev) => ({ ...prev, [selectedFinger]: { ring, color } }));
    }
  };

  return (
    <main className="w-full h-screen overflow-hidden bg-white flex flex-col">
      {/* 상단 영역: 헤더 + 업로드/카메라 버튼 + HandGuide */}
      <div className="flex flex-col items-center w-full" style={{ height: '60vh' }}>
        <div className="mt-[1vh]">
          <Header />
        </div>
        <div className="mt-[1vh]">
          <button
            className="w-[50vw] h-[4vh] rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base"
            type="button"
            onClick={handleCameraOrFile}
          >
            사진 찍기
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
            <div className="text-red-500 text-xs mt-2 text-center">{errorMsg}</div>
          )}
        </div>
        {/* HandGuide가 남는 공간을 모두 차지 */}
        <div className="flex-1 w-full max-w-[300px] flex items-center justify-center">
          <div className="w-[80vw] aspect-square relative">
            {imageUrl ? (
              <>
                <HandLandmarkDetector imageUrl={imageUrl} onRingPositions={setRingPositions} />
                {/* 반지 합성 오버레이 */}
                {ringPositions.map((pos) => (
                  <img
                    key={pos.finger}
                    src="/ring.png"
                    alt={`${pos.finger} ring`}
                    style={{
                      position: 'absolute',
                      left: pos.centerX,
                      top: pos.centerY,
                      width: 55,
                      height: 55,
                      transform: `translate(-50%,-50%) rotate(${pos.angle}rad)` ,
                      pointerEvents: 'none',
                    }}
                  />
                ))}
              </>
            ) : (
              <HandGuide imageUrl={imageUrl} />
            )}
          </div>
        </div>
      </div>
      {/* 하단 영역: FingerPills + 버튼 그룹 */}
      <div className="flex flex-col items-center w-full mb-[2vh]">
        <FingerPills selected={selectedFinger} onSelect={handleFingerSelect} />
        <div className="flex flex-col gap-[1vh] items-center w-full mt-[2.5vh]">
          <button
            className="w-[50vw] h-[4vh] rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base mb-0"
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={!selectedFinger}
          >
            반지 선택하기
          </button>
          <button
            className="w-[50vw] h-[4vh] rounded-full bg-[#dadada] text-white font-semibold text-base flex items-center justify-center mb-0"
            type="button"
            disabled
          >
            -
          </button>
          <button
            className="w-[50vw] h-[4vh] rounded-full bg-[#1a1f26] hover:bg-[#11141a] text-white font-semibold text-base mb-0"
            type="button"
          >
            Share
          </button>
        </div>
      </div>
      {/* 반지 선택 모달 */}
      <RingSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleRingSelect}
      />
      {/* 카메라 모달 */}
      {cameraOpen && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setCameraOpen(false)} />
      )}
    </main>
  );
}
