import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/dashboard/DashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard - Club W',
  description: 'Panel de control de tu cuenta de Club W. Accede a tus pedidos, productos favoritos y más.',
}

export default async function DashboardPage() {
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

  return <DashboardContent user={session.user} />
}