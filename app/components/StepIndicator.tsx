import React from 'react';

interface StepIndicatorProps {
  step: number;
  title: string;
  description: string;
}

export default function StepIndicator({ step, title, description }: StepIndicatorProps) {
  return (
    <div className="text-center mb-4">
      <div className="inline-block px-3 py-1 bg-[#d97a7c] text-white text-xs font-semibold rounded-full mb-2">
        Step {step}
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
