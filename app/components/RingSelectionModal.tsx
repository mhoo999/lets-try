import React, { useEffect, useState } from 'react';

export interface RingColor {
  id: string;
  name: string;
  colorCode: string;
  imageUrl: string;
}

export interface Ring {
  id: string;
  name: string;
  imageUrl: string;
  availableColors: RingColor[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (ring: Ring, color: RingColor) => void;
}

const RingSelectionModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [rings, setRings] = useState<Ring[]>([]);
  const [selectedRing, setSelectedRing] = useState<Ring | null>(null);
  const [selectedColor, setSelectedColor] = useState<RingColor | null>(null);
  const [expandedRingId, setExpandedRingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetch('/data/rings.json')
        .then((res) => res.json())
        .then((data) => setRings(data));
    }
  }, [open]);

  if (!open) return null;

  // Chevron 아이콘 (아래/위)
  const ChevronIcon = ({ up = false }: { up?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={up ? "M7 15l5-5 5 5" : "M7 10l5 5 5-5"} stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-[340px] max-w-[90vw] relative flex flex-col items-center">
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <div className="mb-4 text-lg font-bold">반지 선택</div>
        {/* 반지 리스트 (아코디언) */}
        <div className="w-full flex flex-col gap-2 max-h-[320px] overflow-y-auto mb-2">
          {rings.map((ring) => {
            const isExpanded = expandedRingId === ring.id;
            const isSelected = selectedRing?.id === ring.id;
            return (
              <div key={ring.id} className="bg-[#fdf9f8] rounded-2xl border border-gray-200">
                {/* 헤더: 닫힘/열림 토글 */}
                <div
                  className="flex items-center px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedRingId(isExpanded ? null : ring.id)}
                >
                  <img src={ring.imageUrl} alt={ring.name} className="w-12 h-12 rounded-full border" />
                  <span className="ml-4 flex-1 font-medium text-gray-800">{ring.name}</span>
                  {/* 닫힘 상태: 선택된 컬러칩만 */}
                  {isSelected && selectedColor && !isExpanded && (
                    <span className="w-6 h-6 rounded-full border ml-2" style={{ backgroundColor: selectedColor.colorCode }} />
                  )}
                  <span className="ml-2">
                    <ChevronIcon up={isExpanded} />
                  </span>
                </div>
                {/* 열림: 컬러칩 리스트 */}
                {isExpanded && (
                  <div className="flex gap-2 px-4 pb-3">
                    {ring.availableColors.map((color) => (
                      <button
                        key={color.id}
                        className={`w-8 h-8 rounded-full border-2 ${isSelected && selectedColor?.id === color.id ? 'border-[#d97a7c]' : 'border-gray-200'} flex items-center justify-center`}
                        style={{ backgroundColor: color.colorCode }}
                        onClick={() => { setSelectedRing(ring); setSelectedColor(color); }}
                      >
                        {isSelected && selectedColor?.id === color.id && (
                          <span className="text-white text-xs font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* 선택 버튼 */}
        <button
          className="w-full h-12 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-bold text-base mt-2 disabled:bg-gray-300"
          disabled={!selectedRing || !selectedColor}
          onClick={() => {
            if (selectedRing && selectedColor) {
              onSelect(selectedRing, selectedColor);
              onClose();
              setExpandedRingId(null);
            }
          }}
        >
          선택하기
        </button>
      </div>
    </div>
  );
};

export default RingSelectionModal; 