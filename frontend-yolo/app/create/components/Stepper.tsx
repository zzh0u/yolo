'use client';

import React, { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface StepProps {
  children: ReactNode;
}

export function Step({ children }: StepProps) {
  return <div className="step-content">{children}</div>;
}

interface StepperProps {
  children: ReactNode[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = "Previous",
  nextButtonText = "Next"
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const totalSteps = React.Children.count(children);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      onStepChange?.(step);
    }
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    } else {
      onFinalStepCompleted?.();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const currentStepContent = React.Children.toArray(children)[currentStep - 1];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-between mb-6">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${isCompleted
                      ? 'bg-muted text-black' // Set text to black for completed steps
                      : isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    '完成'
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* 连接线 */}
                {stepNumber < totalSteps && (
                  <div 
                    className={`
                      h-0.5 w-16 mx-2
                      ${isCompleted ? 'bg-primary' : 'bg-muted'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 当前步骤内容 */}
        <div className="min-h-[200px] mb-6">
          {currentStepContent}
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between">
          <Button
            variant="default"
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            {backButtonText}
          </Button>

          <div className="text-sm text-muted-foreground flex items-center">
            Step {currentStep} of {totalSteps}
          </div>

          <Button
            onClick={goToNextStep}
            variant={'default'}
            className="flex items-center gap-2"
          >
            {currentStep === totalSteps ? 'Complete' : nextButtonText}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}