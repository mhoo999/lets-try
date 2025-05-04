import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch {
        setError('카메라 접근에 실패했습니다.');
      }
    })();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/png');
      onCapture(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
      <div className="relative w-full max-w-xs flex flex-col items-center">
        {error ? (
          <div className="text-white text-center p-6">{error}</div>
        ) : (
          <>
            <div className="relative w-full flex justify-center items-center" style={{ aspectRatio: '3/4', maxHeight: 400 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
                style={{ aspectRatio: '3/4', maxHeight: 400 }}
              />
              <div
                className="absolute border-2 border-white border-dashed rounded-xl pointer-events-none"
                style={{
                  width: '70%',
                  height: '80%',
                  top: '10%',
                  left: '15%',
                  background: 'rgba(0,0,0,0.08)',
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-xs opacity-80 select-none">
                  손을 박스 안에 맞춰주세요
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                className="px-6 py-2 rounded-full bg-[#d97a7c] text-white font-semibold text-base"
                onClick={handleCapture}
              >
                촬영
              </button>
              <button
                className="px-6 py-2 rounded-full bg-gray-700 text-white font-semibold text-base"
                onClick={onClose}
              >
                닫기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 