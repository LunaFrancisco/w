'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: string
}

const statusOptions = [
  { value: 'PENDING', label: 'Pendiente', color: 'text-orange-600' },
  { value: 'PAID', label: 'Pagado', color: 'text-blue-600' },
  { value: 'PREPARING', label: 'Preparando', color: 'text-purple-600' },
  { value: 'SHIPPED', label: 'Enviado', color: 'text-indigo-600' },
  { value: 'DELIVERED', label: 'Entregado', color: 'text-green-600' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'text-red-600' },
]

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) {
      toast.info('El estado no ha cambiado')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el estado')
      }
      toast.success('Estado del pedido actualizado correctamente')
      router.refresh()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Error al actualizar el estado del pedido')
      setSelectedStatus(currentStatus) // Revert to original status
    } finally {
      setIsUpdating(false)
    }
  }

  const currentOption = statusOptions.find(option => option.value === currentStatus)
  const selectedOption = statusOptions.find(option => option.value === selectedStatus)

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Cambiar Estado del Pedido
        </label>
        <div className="flex items-center gap-3">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue>
                <span className={selectedOption?.color}>
                  {selectedOption?.label}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className={option.color}>
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleStatusUpdate}
            disabled={isUpdating || selectedStatus === currentStatus}
            size="sm"
          >
            {isUpdating ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <div>Estado actual:</div>
        <div className={`font-medium ${currentOption?.color}`}>
          {currentOption?.label}
        </div>
      </div>
    </div>
  )
}