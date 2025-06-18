'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface OrderStatusActionsProps {
  orderId: string
  currentStatus: string
}

const ORDER_STATUSES = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PREPARING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
}

const STATUS_TRANSITIONS = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: []
}

export default function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const router = useRouter()

  const availableStatuses = STATUS_TRANSITIONS[currentStatus as keyof typeof STATUS_TRANSITIONS] || []

  const handleStatusUpdate = async () => {
    if (!newStatus) return

    setIsUpdating(true)
    
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el estado del pedido')
      }

      toast.success(`Estado actualizado a: ${ORDER_STATUSES[newStatus as keyof typeof ORDER_STATUSES]}`)
      router.refresh()
      setNewStatus('')
    } catch (error) {
      toast.error('Error al actualizar el estado del pedido')
      console.error('Error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (availableStatuses.length === 0) {
    return (
      <div className="pt-4 border-t">
        <p className="text-sm text-gray-500">
          No hay cambios de estado disponibles para este pedido.
        </p>
      </div>
    )
  }

  return (
    <div className="pt-4 border-t space-y-3">
      <div className="flex items-center space-x-3">
        <Select value={newStatus} onValueChange={setNewStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Cambiar estado..." />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUSES[status as keyof typeof ORDER_STATUSES]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleStatusUpdate}
          disabled={!newStatus || isUpdating}
          size="sm"
        >
          {isUpdating ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>
      
      <p className="text-xs text-gray-500">
        Estado actual: <span className="font-medium">
          {ORDER_STATUSES[currentStatus as keyof typeof ORDER_STATUSES]}
        </span>
      </p>
    </div>
  )
}