'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  image?: string
  role: 'ADMIN' | 'CLIENT' | 'PENDING'
  emailVerified?: Date | null
  createdAt: Date
  updatedAt: Date
  accounts: Array<{ provider: string }>
  accessRequest?: {
    id: string
    status: string
    createdAt: Date
  }
  _count: {
    orders: number
    addresses: number
    processedRequests: number
  }
}

interface UserStats {
  total: number
  admins: number
  clients: number
  pending: number
  verified: number
}

interface UsersResponse {
  users: User[]
  stats: UserStats
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters?: any
}

interface UseUsersReturn {
  users: User[]
  stats: UserStats
  loading: boolean
  error: string | null
  refetch: () => void
  updateUserRole: (userId: string, newRole: string) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
}

export function useUsers(): UseUsersReturn {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error de conexión' }))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUserRole = useCallback(async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar rol')
      }

      const result = await response.json()
      toast.success(result.message || 'Rol actualizado correctamente')
      
      // Refetch users to get updated data
      await fetchUsers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      toast.error(`Error al actualizar rol: ${errorMessage}`)
      throw err
    }
  }, [fetchUsers])

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar usuario')
      }

      const result = await response.json()
      toast.success(result.message || 'Usuario eliminado correctamente')
      
      // Refetch users to get updated data
      await fetchUsers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      toast.error(`Error al eliminar usuario: ${errorMessage}`)
      throw err
    }
  }, [fetchUsers])

  // Fetch users on mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users: data?.users || [],
    stats: data?.stats || {
      total: 0,
      admins: 0,
      clients: 0,
      pending: 0,
      verified: 0,
    },
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    deleteUser
  }
}