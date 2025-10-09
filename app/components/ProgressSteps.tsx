import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, label: 'Take Photo' },
    { number: 2, label: 'Select Ring' },
    { number: 3, label: 'Preview' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 w-full px-4 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                currentStep >= step.number
                  ? 'bg-[#d97a7c] text-white'
                  : 'bg-[#e8e8e8] text-gray-400'
              }`}
            >
              {step.number}
            </div>
            <span
              className={`text-xs font-medium ${
                currentStep >= step.number ? 'text-[#d97a7c]' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-[2px] w-12 transition-all ${
                currentStep > step.number ? 'bg-[#d97a7c]' : 'bg-[#e8e8e8]'
              }`}
              style={{ marginBottom: '20px' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
