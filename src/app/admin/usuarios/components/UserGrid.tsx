'use client'

import { 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  MapPin,
  MoreHorizontal,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

interface UserGridProps {
  users: User[]
  loading?: boolean
  currentUserId?: string
  onRoleChange?: (userId: string, newRole: string) => void
  onDeleteUser?: (userId: string) => void
}

export default function UserGrid({ 
  users, 
  loading = false, 
  currentUserId,
  onRoleChange,
  onDeleteUser 
}: UserGridProps) {
  const router = useRouter()

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { 
        label: 'Administrador', 
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Shield 
      },
      CLIENT: { 
        label: 'Cliente', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle 
      },
      PENDING: { 
        label: 'Pendiente', 
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock 
      },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || 
                   { 
                     label: role, 
                     className: 'bg-gray-100 text-gray-800 border-gray-200',
                     icon: AlertCircle 
                   }

    const IconComponent = config.icon

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleViewUser = (userId: string) => {
    router.push(`/admin/usuarios/${userId}`)
  }

  const handleEditUser = (userId: string) => {
    router.push(`/admin/usuarios/${userId}/editar`)
  }

  const handleDeleteUser = (userId: string) => {
    if (onDeleteUser) {
      onDeleteUser(userId)
    }
  }

  const getAccountProviders = (accounts: Array<{ provider: string }>) => {
    const providers = accounts.map(account => account.provider)
    return providers.length > 0 ? providers.join(', ') : 'Email'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <ShoppingBag className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron usuarios
        </h3>
        <p className="text-gray-500">
          Intenta ajustar los filtros o agregar nuevos usuarios.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {users.map((user) => (
        <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage src={user.image || ''} alt={user.name} />
                  <AvatarFallback className="text-sm font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => handleViewUser(user.id)}
                    className="font-medium text-gray-900 hover:text-orange-600 transition-colors text-left block truncate"
                    title={user.name}
                  >
                    {user.name || 'Sin nombre'}
                  </button>
                  <p className="text-sm text-gray-600 truncate" title={user.email}>
                    {user.email}
                  </p>
                  <div className="text-xs text-gray-400 mt-1">
                    ID: {user.id.slice(-8)}
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  {user.id !== currentUserId && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Rol y estado */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                {getRoleBadge(user.role)}
                {user.id === currentUserId && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Tú
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {user.emailVerified ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <Mail className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                    <Mail className="w-3 h-3 mr-1" />
                    No verificado
                  </Badge>
                )}
                
                {user.accessRequest && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      user.accessRequest.status === 'APPROVED' 
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : user.accessRequest.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    {user.accessRequest.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {user.accessRequest.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                    {user.accessRequest.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                    Solicitud {user.accessRequest.status.toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>

            {/* Información de registro */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Registro: {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                Método: {getAccountProviders(user.accounts)}
              </div>
            </div>

            {/* Estadísticas de actividad */}
            <div className="space-y-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{user._count.orders}</span>
                  <span className="text-xs text-gray-500">pedidos</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{user._count.addresses}</span>
                  <span className="text-xs text-gray-500">direcciones</span>
                </div>
              </div>
              
              {user._count.processedRequests > 0 && (
                <div className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                  Ha procesado {user._count.processedRequests} solicitudes
                </div>
              )}
            </div>

            {/* Acciones rápidas */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleViewUser(user.id)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditUser(user.id)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}