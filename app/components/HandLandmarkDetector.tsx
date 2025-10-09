import React, { useEffect, useRef, useState } from 'react';
import { drawLandmarks } from '@mediapipe/drawing_utils';
import type { Hands, Results } from '@mediapipe/hands';
// <img> 사용: MediaPipe canvas와 겹치기 위해 SSR/최적화 목적이 아니라면 유지

interface HandLandmarkDetectorProps {
  imageUrl?: string;
  testMode?: boolean;
  onRingPositions?: (positions: { finger: string; centerX: number; centerY: number; angle: number; length: number }[]) => void;
}

// 반지 위치 인덱스 쌍
const RING_PAIRS = [
  { finger: 'thumb', idxA: 2, idxB: 3 },
  { finger: 'index', idxA: 5, idxB: 6 },
  { finger: 'middle', idxA: 9, idxB: 10 },
  { finger: 'ring', idxA: 13, idxB: 14 },
  { finger: 'pinky', idxA: 17, idxB: 18 },
];

export default function HandLandmarkDetector({ imageUrl, testMode = false, onRingPositions }: HandLandmarkDetectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<{x: number, y: number}[]>([]);
  const [hiddenPoints, setHiddenPoints] = useState<Set<number>>(new Set());
  const [ringPositions, setRingPositions] = useState<{ finger: string; centerX: number; centerY: number; angle: number; length: number }[]>([]);

  useEffect(() => {
    if (!imageUrl) return;
    let hands: Hands | null = null;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setLandmarks([]);
    setHiddenPoints(new Set());
    setRingPositions([]);

    const runDetection = async () => {
      if (!imageRef.current) {
        setError('이미지 엘리먼트를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      // 1. 이미지 로드 try/catch
      try {
        await new Promise<void>((resolve, reject) => {
          if (imageRef.current?.complete) resolve();
          else {
            imageRef.current!.onload = () => resolve();
            imageRef.current!.onerror = () => reject('이미지 로드 실패');
          }
        });
      } catch (e) {
        setError(typeof e === 'string' ? e : '이미지 로드 실패');
        setLoading(false);
        return;
      }
      // 2. MediaPipe Hands 동적 import 및 생성자 체크
      try {
        const handsModule = await import('@mediapipe/hands');
        let exportObj: unknown = handsModule;
        if (
          typeof handsModule === 'object' &&
          handsModule !== null &&
          'default' in handsModule &&
          typeof (handsModule as { [key: string]: unknown }).default === 'object'
        ) {
          exportObj = (handsModule as { [key: string]: unknown }).default;
        }
        console.log('exportObj:', exportObj);
        let handsInstance: Hands | null = null;
        const obj = exportObj as { [key: string]: unknown };
        if (typeof obj.createHands === 'function') {
          handsInstance = (obj.createHands as (config: unknown) => Hands)({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
        } else if (typeof obj.Hands === 'function') {
          handsInstance = new (obj.Hands as new (config: unknown) => Hands)({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
        } else if (typeof obj.default === 'function') {
          handsInstance = new (obj.default as new (config: unknown) => Hands)({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
        } else if (
          obj.Hands &&
          typeof (obj.Hands as { create?: (config: unknown) => Hands }).create === 'function'
        ) {
          handsInstance = ((obj.Hands as { create: (config: unknown) => Hands }).create)({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
        } else {
          setError('MediaPipe Hands 생성자를 찾을 수 없습니다. (export 구조: ' + Object.keys(obj).join(', ') + ')');
          setLoading(false);
          return;
        }
        hands = handsInstance;
        if (hands && typeof hands.setOptions === 'function') {
          hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
          });
        }
        if (hands && typeof hands.onResults === 'function') {
          hands.onResults((results: Results) => {
            if (!isMounted) return;
            const points = (results.multiHandLandmarks?.[0] || []) as { x: number; y: number }[];
            setLandmarks(points.map((pt) => ({ x: pt.x, y: pt.y })));
            // 반지 위치/각도/길이 계산
            const canvas = canvasRef.current;
            const ringPos = RING_PAIRS.map(({ finger, idxA, idxB }) => {
              if (!points[idxA] || !points[idxB] || !canvas) return null;
              const a = points[idxA];
              const b = points[idxB];
              const centerX = ((a.x + b.x) / 2) * canvas.width;
              const centerY = ((a.y + b.y) / 2) * canvas.height;
              const angle = Math.atan2(b.y - a.y, b.x - a.x); // 라디안
              // 손가락 길이(픽셀)
              const dx = (b.x - a.x) * canvas.width;
              const dy = (b.y - a.y) * canvas.height;
              const length = Math.sqrt(dx * dx + dy * dy);
              return { finger, centerX, centerY, angle, length };
            }).filter(Boolean) as { finger: string; centerX: number; centerY: number; angle: number; length: number }[];
            setRingPositions(ringPos);
            if (onRingPositions) onRingPositions(ringPos);
            // 캔버스에 시각화
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx && imageRef.current) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // 이미지 비율 유지하며 캔버스에 꽉 차게 그리기 (object-fit: contain)
              const img = imageRef.current;
              const imgW = img.naturalWidth;
              const imgH = img.naturalHeight;
              const canvasW = canvas.width;
              const canvasH = canvas.height;
              const imgRatio = imgW / imgH;
              const canvasRatio = canvasW / canvasH;
              let drawW = canvasW, drawH = canvasH, offsetX = 0, offsetY = 0;
              // contain: 이미지 전체가 보이도록
              if (imgRatio > canvasRatio) {
                drawW = canvasW;
                drawH = imgH * (canvasW / imgW);
                offsetY = (canvasH - drawH) / 2;
              } else {
                drawH = canvasH;
                drawW = imgW * (canvasH / imgH);
                offsetX = (canvasW - drawW) / 2;
              }
              ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
              if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
                if (testMode) {
                  // landmark 점/선
                  drawLandmarks(ctx, results.multiHandLandmarks[0], { color: '#d97a7c', lineWidth: 2, radius: 4 });
                  // 반지 위치 가이드 표시
                  ringPos.forEach((pos) => {
                    if (!pos) return;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(pos.centerX, pos.centerY, 18, 0, 2 * Math.PI);
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([6, 6]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                  });
                  // 숫자 표시
                  (results.multiHandLandmarks[0] as { x: number; y: number }[]).forEach((pt, idx) => {
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
        }
        if (hands && typeof hands.send === 'function') {
          await hands.send({ image: imageRef.current! });
        }
        setLoading(false);
      } catch (e) {
        setError(typeof e === 'string' ? e : 'MediaPipe Hands 처리 중 오류 발생');
        setLoading(false);
        return;
      }
    };
    runDetection();
    return () => {
      isMounted = false;
      if (hands && typeof hands.close === 'function') {
        hands.close();
      }
    };
  }, [imageUrl, testMode, onRingPositions]);

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
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="absolute top-0 left-0 w-full h-full z-10"
        style={{ objectFit: 'contain', cursor: testMode ? 'pointer' : 'default' }}
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
      {testMode && ringPositions.length > 0 && (
        <pre className="absolute bottom-2 left-2 bg-white/80 text-xs p-2 rounded z-20 max-w-[90%] max-h-[40%] overflow-auto">
          {JSON.stringify(ringPositions, null, 2)}
        </pre>
      )}
    </div>
  );
} 