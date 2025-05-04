import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { drawLandmarks } from '@mediapipe/drawing_utils';

interface HandLandmarkDetectorProps {
  imageUrl?: string;
}

export default function HandLandmarkDetector({ imageUrl }: HandLandmarkDetectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) return;
    let hands: Hands | null = null;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setLandmarks([]);

    const runDetection = async () => {
      if (!imageRef.current) return;
      // 이미지가 로드될 때까지 대기
      await new Promise<void>((resolve, reject) => {
        if (imageRef.current?.complete) resolve();
        else imageRef.current!.onload = () => resolve();
        imageRef.current!.onerror = () => reject('이미지 로드 실패');
      });
      try {
        // MediaPipe Hands 인스턴스 생성
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
          setLandmarks(results.multiHandLandmarks?.[0] || []);
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
        // 이미지 처리
        await hands.send({ image: imageRef.current! });
        setLoading(false);
      } catch (e: any) {
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
      <img ref={imageRef} src={imageUrl} alt="손 이미지" className="hidden" crossOrigin="anonymous" />
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">분석 중...</div>}
      {error && <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 z-20">{error}</div>}
    </div>
  );
} 