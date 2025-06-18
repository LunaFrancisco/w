'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface UserRoleActionsProps {
  userId: string
  currentRole: string
}

const USER_ROLES = {
  ADMIN: 'Administrador',
  CLIENT: 'Cliente',
  PENDING: 'Pendiente'
}

export default function UserRoleActions({ userId, currentRole }: UserRoleActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const router = useRouter()

  const handleRoleUpdate = async () => {
    if (!newRole) return

    setIsUpdating(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el rol del usuario')
      }

      toast.success(`Rol actualizado a: ${USER_ROLES[newRole as keyof typeof USER_ROLES]}`)
      router.refresh()
      setNewRole('')
      setShowConfirmDialog(false)
    } catch (error) {
      toast.error('Error al actualizar el rol del usuario')
      console.error('Error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Tendrá acceso completo al panel administrativo y podrá gestionar usuarios, productos y pedidos.'
      case 'CLIENT':
        return 'Tendrá acceso al portal de compras y podrá realizar pedidos.'
      case 'PENDING':
        return 'No tendrá acceso al portal de compras hasta ser aprobado.'
      default:
        return ''
    }
  }

  return (
    <div className="pt-4 border-t space-y-3">
      <div className="flex items-center space-x-3">
        <Select value={newRole} onValueChange={setNewRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Cambiar rol..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(USER_ROLES)
              .filter(([role]) => role !== currentRole)
              .map(([role, label]) => (
                <SelectItem key={role} value={role}>
                  {label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogTrigger asChild>
            <Button
              disabled={!newRole}
              size="sm"
              onClick={() => setShowConfirmDialog(true)}
            >
              Cambiar Rol
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar cambio de rol?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Estás a punto de cambiar el rol de este usuario de{' '}
                  <span className="font-medium">
                    {USER_ROLES[currentRole as keyof typeof USER_ROLES]}
                  </span>{' '}
                  a{' '}
                  <span className="font-medium">
                    {USER_ROLES[newRole as keyof typeof USER_ROLES]}
                  </span>.
                </p>
                <p className="text-sm text-gray-600">
                  {getRoleDescription(newRole)}
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRoleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? 'Actualizando...' : 'Confirmar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <p className="text-xs text-gray-500">
        Rol actual: <span className="font-medium">
          {USER_ROLES[currentRole as keyof typeof USER_ROLES]}
        </span>
      </p>
    </div>
  )
}