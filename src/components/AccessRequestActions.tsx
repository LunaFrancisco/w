'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AccessRequestActionsProps {
  requestId: string
  onUpdate?: () => void
}

export default function AccessRequestActions({ requestId, onUpdate }: AccessRequestActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const router = useRouter()

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/admin/access-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status: action,
          adminNotes: notes || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Error al procesar la solicitud')
      }

      toast.success(`Solicitud ${action === 'APPROVED' ? 'aprobada' : 'rechazada'} correctamente`)
      
      // Call onUpdate if provided, otherwise fallback to router.refresh()
      if (onUpdate) {
        onUpdate()
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
      console.error('Error:', error)
    } finally {
      setIsProcessing(false)
      setShowNotes(false)
      setNotes('')
    }
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      {showNotes && (
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notas administrativas (opcional)
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Añade notas sobre esta decisión..."
            rows={3}
          />
        </div>
      )}
      
      <div className="flex space-x-3">
          <>
            <Button
              onClick={() => handleAction('APPROVED')}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {isProcessing ? 'Procesando...' : 'Aprobar'}
            </Button>
            <Button
              onClick={() => handleAction('REJECTED')}
              disabled={isProcessing}
              variant="destructive"
              size="sm"
            >
              {isProcessing ? 'Procesando...' : 'Rechazar'}
            </Button>
          </>
      </div>
    </div>
  )
}