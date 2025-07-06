'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AccessRequestActionsProps {
  requestId: string
  onUpdate?: () => void
  compact?: boolean
}

export default function AccessRequestActions({ requestId, onUpdate, compact = false }: AccessRequestActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const router = useRouter()

  const handleActionClick = (action: 'APPROVED' | 'REJECTED') => {
    setPendingAction(action)
    setShowConfirmDialog(true)
  }

  const handleConfirmAction = async () => {
    if (!pendingAction) return
    
    setIsProcessing(true)
    setShowConfirmDialog(false)
    
    try {
      const response = await fetch('/api/admin/access-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status: pendingAction,
          adminNotes: notes || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Error al procesar la solicitud')
      }

      toast.success(`Solicitud ${pendingAction === 'APPROVED' ? 'aprobada' : 'rechazada'} correctamente`)
      
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
      setPendingAction(null)
    }
  }

  const handleCancelAction = () => {
    setShowConfirmDialog(false)
    setPendingAction(null)
  }

  if (compact) {
    return (
      <>
        <div className="flex space-x-1">
          <Button
            onClick={() => handleActionClick('APPROVED')}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            {isProcessing ? '...' : 'Aprobar'}
          </Button>
          <Button
            onClick={() => handleActionClick('REJECTED')}
            disabled={isProcessing}
            variant="destructive"
            size="sm"
          >
            {isProcessing ? '...' : 'Rechazar'}
          </Button>
        </div>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingAction === 'APPROVED' ? '¿Aprobar solicitud?' : '¿Rechazar solicitud?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingAction === 'APPROVED' 
                  ? 'Esta acción aprobará la solicitud de acceso y otorgará permisos de cliente al usuario. Esta acción no se puede deshacer.'
                  : 'Esta acción rechazará la solicitud de acceso. El usuario no tendrá acceso al club privado. Esta acción no se puede deshacer.'
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelAction}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAction}
                className={pendingAction === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {pendingAction === 'APPROVED' ? 'Sí, aprobar' : 'Sí, rechazar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
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
                onClick={() => handleActionClick('APPROVED')}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                {isProcessing ? 'Procesando...' : 'Aprobar'}
              </Button>
              <Button
                onClick={() => handleActionClick('REJECTED')}
                disabled={isProcessing}
                variant="destructive"
                size="sm"
              >
                {isProcessing ? 'Procesando...' : 'Rechazar'}
              </Button>
            </>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === 'APPROVED' ? '¿Aprobar solicitud?' : '¿Rechazar solicitud?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === 'APPROVED' 
                ? 'Esta acción aprobará la solicitud de acceso y otorgará permisos de cliente al usuario. Esta acción no se puede deshacer.'
                : 'Esta acción rechazará la solicitud de acceso. El usuario no tendrá acceso al club privado. Esta acción no se puede deshacer.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAction}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={pendingAction === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {pendingAction === 'APPROVED' ? 'Sí, aprobar' : 'Sí, rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}