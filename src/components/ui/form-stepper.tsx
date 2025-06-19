'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
}

interface FormStepperProps {
  steps: Step[]
  currentStep: number
  completedSteps?: number[]
  className?: string
}

export function FormStepper({ 
  steps, 
  currentStep, 
  completedSteps = [], 
  className 
}: FormStepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex items-start justify-between">
        {/* Background connector line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0" 
             style={{
               left: `calc(${100 / (steps.length - 1) / 2}% - 0.75rem)`,
               right: `calc(${100 / (steps.length - 1) / 2}% - 0.75rem)`
             }} 
        />
        
        {/* Progress line */}
        {currentStep > 0 && (
          <div className="absolute top-6 left-0 h-0.5 bg-orange-500 z-0 transition-all duration-500"
               style={{
                 left: `calc(${100 / (steps.length - 1) / 2}% + 0.75rem)`,
                 width: `calc(${(Math.min(currentStep, steps.length - 1)) / (steps.length - 1) * 100}% - ${100 / (steps.length - 1)}% + 0.75rem)`
               }}
          />
        )}

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStep
          const isCurrent = index === currentStep
          const isActive = isCompleted || isCurrent
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
              {/* Step Circle */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white shadow-sm",
                {
                  "bg-green-500 border-green-500 text-white shadow-green-200": isCompleted && !isCurrent,
                  "bg-orange-500 border-orange-500 text-white shadow-orange-200": isCurrent,
                  "bg-gray-50 border-gray-300 text-gray-400": !isActive
                }
              )}>
                {isCompleted && !isCurrent ? (
                  <Check className="w-5 h-5" />
                ) : step.icon ? (
                  <div className="w-5 h-5 flex items-center justify-center">
                    {step.icon}
                  </div>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Step Content */}
              <div className="mt-3 text-center max-w-32">
                <h3 className={cn(
                  "text-sm font-medium leading-tight",
                  {
                    "text-green-600": isCompleted && !isCurrent,
                    "text-orange-600": isCurrent,
                    "text-gray-900": isActive && !isCompleted && !isCurrent,
                    "text-gray-400": !isActive
                  }
                )}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className={cn(
                    "text-xs mt-1 leading-tight",
                    {
                      "text-green-500": isCompleted && !isCurrent,
                      "text-orange-500": isCurrent,
                      "text-gray-600": isActive && !isCompleted && !isCurrent,
                      "text-gray-400": !isActive
                    }
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}