import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfileContent from '@/components/profile/ProfileContent'

export const metadata: Metadata = {
  title: 'Mi Perfil - Club W',
  description: 'Gestiona tu información personal, direcciones y configuración de cuenta en Club W.',
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role === 'PENDING') {
    redirect('/auth/pending')
  }

  if (session.user.role !== 'CLIENT' && session.user.role !== 'ADMIN') {
    redirect('/auth/unauthorized')
  }

  return <ProfileContent user={session.user} />
}