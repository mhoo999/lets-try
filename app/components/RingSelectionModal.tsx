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

  useEffect(() => {
    if (open) {
      fetch('/data/rings.json')
        .then((res) => res.json())
        .then((data) => setRings(data));
    }
  }, [open]);

  useEffect(() => {
    if (selectedRing) {
      setSelectedColor(selectedRing.availableColors[0]);
    } else {
      setSelectedColor(null);
    }
  }, [selectedRing]);

  if (!open) return null;

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
        {/* 반지 목록 */}
        <div className="flex flex-row gap-4 mb-4 overflow-x-auto w-full justify-center">
          {rings.map((ring) => (
            <button
              key={ring.id}
              className={`flex flex-col items-center px-2 py-1 rounded-xl border ${selectedRing?.id === ring.id ? 'border-[#d97a7c] bg-[#fbeaec]' : 'border-gray-200 bg-gray-50'} transition`}
              onClick={() => setSelectedRing(ring)}
            >
              <img src={ring.imageUrl} alt={ring.name} className="w-14 h-14 object-contain mb-1" />
              <span className="text-xs font-medium text-gray-700">{ring.name}</span>
            </button>
          ))}
        </div>
        {/* 컬러칩 */}
        {selectedRing && (
          <div className="flex flex-row gap-3 mb-4">
            {selectedRing.availableColors.map((color) => (
              <button
                key={color.id}
                className={`w-8 h-8 rounded-full border-2 ${selectedColor?.id === color.id ? 'border-[#d97a7c]' : 'border-gray-200'} flex items-center justify-center`}
                style={{ backgroundColor: color.colorCode }}
                onClick={() => setSelectedColor(color)}
              >
                {selectedColor?.id === color.id && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
        {/* 네임택 */}
        {selectedRing && selectedColor && (
          <div className="mb-4 px-4 py-2 rounded-full bg-[#fbeaec] text-[#d97a7c] font-semibold text-sm shadow">
            {selectedRing.name} / {selectedColor.name}
          </div>
        )}
        {/* 선택 버튼 */}
        <button
          className="w-full h-12 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-bold text-base mt-2 disabled:bg-gray-300"
          disabled={!selectedRing || !selectedColor}
          onClick={() => {
            if (selectedRing && selectedColor) {
              onSelect(selectedRing, selectedColor);
              onClose();
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