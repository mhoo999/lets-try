import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, label: 'Take Photo' },
    { number: 2, label: 'Select Ring' },
    { number: 3, label: 'Adjust' },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              currentStep >= step.number
                ? 'bg-[#d97a7c] text-white'
                : 'bg-[#e8e8e8] text-gray-400'
            }`}
          >
            {step.number}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-[2px] w-8 transition-all ${
                currentStep > step.number ? 'bg-[#d97a7c]' : 'bg-[#e8e8e8]'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
