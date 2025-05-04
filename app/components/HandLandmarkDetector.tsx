import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { drawLandmarks } from '@mediapipe/drawing_utils';
// <img> 사용: MediaPipe canvas와 겹치기 위해 SSR/최적화 목적이 아니라면 유지

interface HandLandmarkDetectorProps {
  imageUrl?: string;
  testMode?: boolean;
}

export default function HandLandmarkDetector({ imageUrl, testMode = true }: HandLandmarkDetectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<{x: number, y: number}[]>([]);
  const [hiddenPoints, setHiddenPoints] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!imageUrl) return;
    let hands: Hands | null = null;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setLandmarks([]);
    setHiddenPoints(new Set());

    const runDetection = async () => {
      if (!imageRef.current) return;
      // 이미지가 로드될 때까지 대기
      await new Promise<void>((resolve, reject) => {
        if (imageRef.current?.complete) resolve();
        else imageRef.current!.onload = () => resolve();
        imageRef.current!.onerror = () => reject('이미지 로드 실패');
      });
      try {
        hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7
        });
        hands.onResults((results) => {
          if (!isMounted) return;
          const points = results.multiHandLandmarks?.[0] || [];
          setLandmarks(points.map((pt) => ({ x: pt.x, y: pt.y })));
          // 캔버스에 시각화
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx && imageRef.current) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
            if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
              drawLandmarks(ctx, results.multiHandLandmarks[0], { color: '#d97a7c', lineWidth: 2, radius: 4 });
              // 숫자 표시 (테스트 모드)
              if (testMode) {
                results.multiHandLandmarks[0].forEach((pt, idx) => {
                  if (hiddenPoints.has(idx)) return;
                  const px = pt.x * canvas.width;
                  const py = pt.y * canvas.height;
                  ctx.save();
                  ctx.beginPath();
                  ctx.arc(px, py, 14, 0, 2 * Math.PI);
                  ctx.fillStyle = 'rgba(0,0,0,0.6)';
                  ctx.fill();
                  ctx.font = 'bold 14px sans-serif';
                  ctx.fillStyle = '#fff';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(idx.toString(), px, py);
                  ctx.restore();
                });
              }
            }
          }
        });
        await hands.send({ image: imageRef.current! });
        setLoading(false);
      } catch (e) {
        setError(typeof e === 'string' ? e : 'MediaPipe Hands 처리 중 오류 발생');
        setLoading(false);
      }
    };
    runDetection();
    return () => {
      isMounted = false;
      hands?.close();
    };
  }, [imageUrl, testMode, hiddenPoints]);

  // 포인트 클릭 시 해당 숫자 숨김
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!testMode || !landmarks.length) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // 포인트 반경 내 클릭 시 해당 idx 숨김
    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      const px = pt.x * (canvasRef.current?.width || 1);
      const py = pt.y * (canvasRef.current?.height || 1);
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist < 16) {
        setHiddenPoints((prev) => new Set([...prev, i]));
        break;
      }
    }
  };

  return (
    <div className="relative w-full max-w-[300px] aspect-square bg-[#dadada] rounded-[8px] border border-[#dadada] overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="absolute top-0 left-0 w-full h-full z-10"
        style={{ objectFit: 'cover', cursor: testMode ? 'pointer' : 'default' }}
        onClick={handleCanvasClick}
      />
      <img
        ref={imageRef}
        src={imageUrl}
        alt="손 이미지"
        className="hidden"
        {...(imageUrl && !imageUrl.startsWith('data:') ? { crossOrigin: 'anonymous' } : {})}
      />
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">분석 중...</div>}
      {error && <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 z-20">{error}</div>}
    </div>
  );
} 