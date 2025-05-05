'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import HandGuide from './components/HandGuide';
import FingerPills from './components/FingerPills';
import CameraCapture from './components/CameraCapture';
import HandLandmarkDetector from './components/HandLandmarkDetector';
import RingSelectionModal, { Ring, RingColor } from './components/RingSelectionModal';
import html2canvas from 'html2canvas';

export default function Home() {
  const [selectedFinger, setSelectedFinger] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [ringPositions, setRingPositions] = useState<{ finger: string; centerX: number; centerY: number; angle: number; length?: number }[]>([]);
  const [ringSelections, setRingSelections] = useState<{ [finger: string]: { ring: Ring; color: RingColor } }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [ringSelected, setRingSelected] = useState(false); // 반지 선택 여부
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
    if (!selectedFinger) setSelectedFinger('thumb');
    const finger = selectedFinger || 'thumb';
    setRingSelections({ [finger]: { ring, color } });
    setLastSelectedRing(ring);
    setLastSelectedColor(color);
    setRingSelected(true);
    setModalOpen(false);
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

  // 다운로드 버튼 핸들러
  const handleDownload = () => {
    if (!shareImageUrl) return;
    const siteUrl = 'https://www.haime.shop/';
    const ringName = lastSelectedRing ? lastSelectedRing.name : '';
    const colorName = lastSelectedColor ? lastSelectedColor.name : '';
    const link = document.createElement('a');
    link.href = shareImageUrl;
    link.download = `haime_${ringName}_${colorName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Take a PIC
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
          <div ref={handAreaRef} className="w-[80vw] aspect-square relative">
            {imageUrl ? (
              <>
                <HandLandmarkDetector imageUrl={imageUrl} onRingPositions={setRingPositions} />
                <img id="hand-photo" src={imageUrl} alt="손 사진" style={{ display: 'none' }} />
                {/* 반지 합성 오버레이 */}
                {ringPositions.map((pos) => {
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
              </>
            ) : (
              <HandGuide imageUrl={imageUrl} />
            )}
          </div>
        </div>
      </div>
      {/* 하단 영역: FingerPills + 버튼 그룹 */}
      <div className="flex flex-col items-center w-full mb-[2vh]">
        {/* FingerPills: 반지 선택 전에는 비활성화 */}
        <FingerPills selected={selectedFinger} onSelect={handleFingerSelect} disabled={!ringSelected} />
        <div className="flex flex-col gap-[1.5vh] items-center w-full mt-[2.5vh]">
          {/* 반지 선택 버튼: 사진만 있으면 활성화 */}
          <button
            className={`w-[50vw] h-[4vh] rounded-full font-semibold text-base mb-0 ${imageUrl ? 'bg-[#d97a7c] hover:bg-[#c96a6c] text-white' : 'bg-[#dadada] text-gray-400 cursor-not-allowed'}`}
            type="button"
            onClick={handleOpenRingModal}
            disabled={!imageUrl}
          >
            Select a ring
          </button>

          {/* 네임택(Pill) */}
          <div
            className="w-[50vw] h-[4vh] rounded-full font-semibold text-base mb-0 bg-[#dadada] text-[#ffffff] flex items-center justify-center"
            style={{ margin: '0 auto' }}
          >
            {lastSelectedRing ? lastSelectedRing.name : '-'}
          </div>

          {/* 공유 버튼: 사진+손가락+반지/컬러까지 선택 시에만 활성화 */}
          <button
            className={`w-[50vw] h-[4vh] rounded-full font-semibold text-base mb-0 ${imageUrl && selectedFinger && ringSelections[selectedFinger] ? 'bg-[#595B60] hover:bg-[#44444a] text-white' : 'bg-[#dadada] text-gray-400 cursor-not-allowed'}`}
            type="button"
            disabled={!imageUrl || !selectedFinger || !ringSelections[selectedFinger]}
            onClick={handleShare}
          >
            Share
          </button>
        </div>
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
            <img src={shareImageUrl} alt="공유 이미지 미리보기" className="w-full rounded-xl border mb-4" style={{ maxHeight: 320, objectFit: 'contain' }} />
            <button
              className="w-full h-12 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-bold text-base mt-2"
              onClick={handleDownload}
            >
              이미지 다운로드
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

