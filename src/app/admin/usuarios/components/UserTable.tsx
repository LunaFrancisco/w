'use client'

import { 
  Eye, 
  Edit, 
  Trash2, 
  Mail,
  Calendar,
  ShoppingBag,
  MapPin,
  MoreHorizontal
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
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

interface UserTableProps {
  users: User[]
  loading?: boolean
  currentUserId?: string
  onRoleChange?: (userId: string, newRole: string) => void
  onDeleteUser?: (userId: string) => void
}

export default function UserTable({ 
  users, 
  loading = false, 
  currentUserId,
  onDeleteUser 
}: UserTableProps) {
  const router = useRouter()
  
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: 'Administrador', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      CLIENT: { label: 'Cliente', className: 'bg-green-100 text-green-800 border-green-200' },
      PENDING: { label: 'Pendiente', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || 
                   { label: role, className: 'bg-gray-100 text-gray-800 border-gray-200' }

    return (
      <Badge variant="outline" className={config.className}>
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

  if (loading) {
    return (
      <Card className="w-full">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card className="w-full">
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Table className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros o agregar nuevos usuarios.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]"> {/* Minimum width for table structure */}
          <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Usuario
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Email
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Rol
                </div>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Registro
                </div>
              </TableHead>
              <TableHead>Actividad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                {/* Usuario */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.image || ''} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="font-medium text-gray-900 hover:text-orange-600 transition-colors text-left"
                      >
                        {user.name || 'Sin nombre'}
                      </button>
                      <div className="text-xs text-gray-500">
                        ID: {user.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{user.email}</span>
                    {user.emailVerified && (
                      <Mail className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                  {user.accounts.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {user.accounts.map(account => account.provider).join(', ')}
                    </div>
                  )}
                </TableCell>

                {/* Rol */}
                <TableCell>
                  {getRoleBadge(user.role)}
                  {user.id === currentUserId && (
                    <div className="text-xs text-blue-600 mt-1">Tú</div>
                  )}
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <div className="space-y-1">
                    {user.emailVerified ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        No verificado
                      </Badge>
                    )}
                    {user.accessRequest && (
                      <Badge 
                        variant="outline" 
                        className={
                          user.accessRequest.status === 'APPROVED' 
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : user.accessRequest.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        Solicitud {user.accessRequest.status.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Registro */}
                <TableCell>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {format(new Date(user.createdAt), 'HH:mm', { locale: es })}
                    </div>
                  </div>
                </TableCell>

                {/* Actividad */}
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <ShoppingBag className="w-3 h-3" />
                      <span>{user._count.orders} pedidos</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{user._count.addresses} direcciones</span>
                    </div>
                    {user._count.processedRequests > 0 && (
                      <div className="text-xs text-blue-600">
                        {user._count.processedRequests} solicitudes procesadas
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  )
}