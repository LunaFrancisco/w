'use client'

import { useSession } from 'next-auth/react'
import { AlertCircle } from 'lucide-react'
import UserProfile from '../components/UserProfile'

interface UserProfilePageProps {
  params: {
    id: string
  }
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <UserProfile 
      userId={params.id} 
      currentUserId={session.user.id}
    />
  )
}