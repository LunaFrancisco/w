'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertCircle } from 'lucide-react'

// Components
import UserViewToggle, { ViewType } from './components/UserViewToggle'
import UserTable from './components/UserTable'
import UserGrid from './components/UserGrid'

// Hooks
import { useUsers } from '@/hooks/useUsers'
import { useSession } from 'next-auth/react'

export default function UsersManagementPage() {
  const { data: session, status } = useSession()
  const [currentView, setCurrentView] = useState<ViewType>('grid')
  
  const {
    users,
    stats,
    loading,
    error,
    refetch,
    updateUserRole,
    deleteUser
  } = useUsers()

  // Load saved view preference
  useEffect(() => {
    const savedView = localStorage.getItem('userViewPreference') as ViewType
    if (savedView && ['grid', 'table'].includes(savedView)) {
      setCurrentView(savedView)
    }
  }, [])

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
    } catch (error) {
      // Error is already handled in the hook with toast
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await deleteUser(userId)
      } catch (error) {
        // Error is already handled in the hook with toast
      }
    }
  }

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // The middleware should handle auth, but double-check here
  if (status === 'unauthenticated' || !session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso no autorizado</h3>
        <p className="text-gray-500">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">
          Administra todos los usuarios del sistema de manera avanzada
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.admins.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.clients.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Verificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.verified.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* View Toggle and Controls */}
      <UserViewToggle
        currentView={currentView}
        onViewChange={handleViewChange}
        totalUsers={stats.total}
        filteredUsers={stats.total}
      />

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Error al cargar usuarios</p>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 text-sm text-red-800 underline hover:no-underline"
            >
              Intentar de nuevo
            </button>
          </CardContent>
        </Card>
      )}

      {/* Users Content */}
      {!error && (
        <>
          {currentView === 'table' ? (
            <UserTable
              users={users}
              loading={loading}
              currentUserId={session.user.id}
              onRoleChange={handleRoleChange}
              onDeleteUser={handleDeleteUser}
            />
          ) : (
            <UserGrid
              users={users}
              loading={loading}
              currentUserId={session.user.id}
              onRoleChange={handleRoleChange}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </>
      )}
    </div>
  )
}