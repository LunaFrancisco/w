import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import UserRoleActions from '@/components/UserRoleActions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function UsersManagementPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/unauthorized')
  }

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          orders: true,
          addresses: true,
          processedRequests: true
        }
      },
      accessRequest: {
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    pending: users.filter(u => u.role === 'PENDING').length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">
          Administra todos los usuarios del sistema
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {userStats.total}
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
              {userStats.admins}
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
              {userStats.clients}
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
              {userStats.pending}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay usuarios en el sistema
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <UserCard key={user.id} user={user} currentUserId={session.user.id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UserCard({ user, currentUserId }: { user: any; currentUserId: string }) {
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: 'Administrador', className: 'bg-purple-100 text-purple-800' },
      CLIENT: { label: 'Cliente', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Pendiente', className: 'bg-orange-100 text-orange-800' },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || 
                   { label: role, className: 'bg-gray-100 text-gray-800' }

    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.image || ''} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900">{user.name}</h3>
              {getRoleBadge(user.role)}
            </div>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500">
              ID: {user.id.slice(-8)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            Registro: {new Date(user.createdAt).toLocaleDateString('es-ES')}
          </p>
          {user.googleId && (
            <p className="text-xs text-gray-500">
              Google SSO
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Pedidos realizados:</span>
          <p className="font-medium">{user._count.orders}</p>
        </div>
        
        <div>
          <span className="text-gray-500">Direcciones:</span>
          <p className="font-medium">{user._count.addresses}</p>
        </div>
        
        <div>
          <span className="text-gray-500">Solicitudes:</span>
          <p className="font-medium">{user.accessRequest ? '1' : '0'}</p>
        </div>
      </div>

      {/* Don't allow changing role of current user */}
      {user.id !== currentUserId && (
        <UserRoleActions userId={user.id} currentRole={user.role} />
      )}
      
      {user.id === currentUserId && (
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500">
            Este es tu usuario. No puedes cambiar tu propio rol.
          </p>
        </div>
      )}
    </div>
  )
}