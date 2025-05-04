import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { drawLandmarks } from '@mediapipe/drawing_utils';
import Image from 'next/image';

interface HandLandmarkDetectorProps {
  imageUrl?: string;
}

export default function HandLandmarkDetector({ imageUrl }: HandLandmarkDetectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) return;
    let hands: Hands | null = null;
    let isMounted = true;
    setLoading(true);
    setError(null);

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
          // 캔버스에 시각화
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx && imageRef.current) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
            if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
              drawLandmarks(ctx, results.multiHandLandmarks[0], { color: '#d97a7c', lineWidth: 2, radius: 4 });
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
  }, [imageUrl]);

  return (
    <div className="relative w-full h-full aspect-square">
      {/* 이미지와 캔버스 겹치기 */}
      <canvas ref={canvasRef} width={300} height={300} className="absolute top-0 left-0 w-full h-full z-10" />
      {/* next/image는 canvas와 겹치기 어려우므로, SSR/최적화가 필요할 때만 사용. 현재는 숨김 처리된 <img> 유지 */}
      <img ref={imageRef} src={imageUrl} alt="손 이미지" className="hidden" crossOrigin="anonymous" />
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">분석 중...</div>}
      {error && <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 z-20">{error}</div>}
    </div>
  );
} 