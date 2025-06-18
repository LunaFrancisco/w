import React from 'react'
import { Check, Clock, Truck, Package, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperProps {
  currentStatus: string
  className?: string
}

interface Step {
  key: string
  label: string
  icon: React.ReactNode
  description: string
}

const steps: Step[] = [
  {
    key: 'PREPARING',
    label: 'En Preparación',
    icon: <Clock className="w-5 h-5" />,
    description: 'Preparando tu pedido'
  },
  {
    key: 'SHIPPED',
    label: 'Enviado',
    icon: <Package className="w-5 h-5" />,
    description: 'Pedido enviado'
  },
  {
    key: 'IN_TRANSIT',
    label: 'En Tránsito',
    icon: <Truck className="w-5 h-5" />,
    description: 'En camino a destino'
  },
  {
    key: 'DELIVERED',
    label: 'Entregado',
    icon: <CheckCircle className="w-5 h-5" />,
    description: 'Pedido entregado'
  }
]

export function OrderStepper({ currentStatus, className }: StepperProps) {
  const getCurrentStepIndex = (status: string): number => {
    switch (status) {
      case 'PENDING':
      case 'PAID':
        return -1 // Before first step
      case 'PREPARING':
        return 0
      case 'SHIPPED':
        return 1
      case 'DELIVERED':
        return 3
      case 'CANCELLED':
        return -2 // Special case for cancelled
      default:
        return -1
    }
  }

  const currentStepIndex = getCurrentStepIndex(currentStatus)
  const isCancelled = currentStatus === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 text-xl">✕</span>
            </div>
            <p className="text-red-800 font-medium">Pedido Cancelado</p>
            <p className="text-red-600 text-sm">Este pedido ha sido cancelado</p>
          </div>
        </div>
      </div>
    )
  }

  if (currentStepIndex === -1) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-orange-800 font-medium">Procesando Pedido</p>
            <p className="text-orange-600 text-sm">Tu pedido está siendo procesado</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex items-center justify-between">
        {/* Background connector line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300 z-0" 
             style={{
               left: `calc(${100 / (steps.length - 1) / 2}% - 1rem)`,
               right: `calc(${100 / (steps.length - 1) / 2}% - 1rem)`
             }} 
        />
        
        {/* Progress line */}
        {currentStepIndex > 0 && (
          <div className="absolute top-6 left-0 h-0.5 bg-green-500 z-0 transition-all duration-500"
               style={{
                 left: `calc(${100 / (steps.length - 1) / 2}% + 1.5rem)`,
                 width: `calc(${(currentStepIndex) / (steps.length - 1) * 100}% - ${100 / (steps.length - 1)}% + 1.5rem)`
               }}
          />
        )}

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isActive = isCompleted || isCurrent
          
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
              {/* Step Circle */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 bg-white",
                {
                  "bg-green-500 border-green-500 text-white": isCompleted,
                  "bg-blue-500 border-blue-500 text-white": isCurrent,
                  "bg-gray-100 border-gray-300 text-gray-400": !isActive
                }
              )}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-sm font-medium h-2",
                  {
                    "text-green-600": isCompleted,
                    "text-blue-600": isCurrent,
                    "text-gray-400": !isActive
                  }
                )}>
                  {step.label}
                </p>
                <p className={cn(
                  "text-xs mt-1 h-6",
                  {
                    "text-green-500": isCompleted,
                    "text-blue-500": isCurrent,
                    "text-gray-400": !isActive
                  }
                )}>
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}