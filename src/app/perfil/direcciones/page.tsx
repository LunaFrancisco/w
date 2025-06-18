import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AddressesContent from '@/components/addresses/AddressesContent'

export const metadata: Metadata = {
  title: 'Mis Direcciones - Club W',
  description: 'Gestiona tus direcciones de envío para tus pedidos en Club W.',
}

export default async function AddressesPage() {
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

  return <AddressesContent user={session.user} />
}