'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Calendar, 
  Shield, 
  MapPin, 
  ShoppingBag, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  CreditCard,
  Activity,
  Eye,
  MoreHorizontal,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserData {
  id: string
  name: string
  email: string
  image?: string
  role: 'ADMIN' | 'CLIENT' | 'PENDING'
  emailVerified?: Date | null
  createdAt: Date
  updatedAt: Date
  accounts: Array<{
    id: string
    provider: string
    providerAccountId: string
    type: string
  }>
  addresses: Array<{
    id: string
    name: string
    street: string
    commune: string
    city: string
    region: string
    zipCode: string
    phone: string
    isDefault: boolean
    createdAt: Date
  }>
  orders: Array<{
    id: string
    status: string
    total: number
    createdAt: Date
    items: Array<{
      quantity: number
      price: number
      product: { name: string }
    }>
  }>
  accessRequest?: {
    id: string
    status: string
    documents: any[]
    adminNotes?: string
    createdAt: Date
    processedAt?: Date
    processor?: { name: string; email: string }
  }
  processedRequests: Array<{
    id: string
    status: string
    createdAt: Date
    processedAt: Date
    user: { name: string; email: string }
  }>
  _count: {
    orders: number
    addresses: number
    processedRequests: number
  }
}

interface UserStats {
  totalOrders: number
  totalSpent: number
  ordersByStatus: Record<string, number>
  totalAddresses: number
  processedRequests: number
  lastOrderDate?: Date
  accountAge: number
}

interface UserProfileProps {
  userId: string
  currentUserId?: string
}

export default function UserProfile({ userId, currentUserId }: UserProfileProps) {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar datos del usuario')
      }
      
      const data = await response.json()
      setUserData(data.user)
      setUserStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast.error('Error al cargar el perfil del usuario')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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

  const getOrderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: 'Pagado', className: 'bg-blue-100 text-blue-800' },
      PREPARING: { label: 'Preparando', className: 'bg-orange-100 text-orange-800' },
      SHIPPED: { label: 'Enviado', className: 'bg-purple-100 text-purple-800' },
      DELIVERED: { label: 'Entregado', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const handleEdit = () => {
    router.push(`/admin/usuarios/${userId}/editar`)
  }

  const handleBack = () => {
    router.push('/admin/usuarios')
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/pedidos/${orderId}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuario</h3>
        <p className="text-gray-500 mb-4">{error || 'Usuario no encontrado'}</p>
        <Button onClick={handleBack} variant="outline">
          Volver a la lista
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perfil de Usuario</h1>
            <p className="text-gray-600">
              Información detallada y actividad del usuario
            </p>
          </div>
        </div>
        
        {userId !== currentUserId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar usuario
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar usuario
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* User Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userData.image} alt={userData.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                      {getRoleBadge(userData.role)}
                      {userId === currentUserId && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Tú
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {userData.email}
                      {userData.emailVerified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                          Verificado
                        </Badge>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Registro: {format(new Date(userData.createdAt), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Activity className="w-4 h-4" />
                      <span>
                        Última actividad: {format(new Date(userData.updatedAt), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Antigüedad: {userStats?.accountAge} días
                      </span>
                    </div>

                    {userData.accounts.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span>
                          Métodos: {userData.accounts.map(acc => acc.provider).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {userData._count.orders}
                  </div>
                  <div className="text-xs text-blue-600">Pedidos</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${userStats?.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">Total gastado</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {userData._count.addresses}
                  </div>
                  <div className="text-xs text-purple-600">Direcciones</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {userData._count.processedRequests}
                  </div>
                  <div className="text-xs text-orange-600">Procesadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Request */}
          {userData.accessRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Solicitud de Acceso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <Badge variant="outline" className={
                      userData.accessRequest.status === 'APPROVED' 
                        ? 'bg-green-50 text-green-700'
                        : userData.accessRequest.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }>
                      {userData.accessRequest.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Solicitado:</span>
                    <p className="text-sm">
                      {format(new Date(userData.accessRequest.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>

                  {userData.accessRequest.processedAt && (
                    <div>
                      <span className="text-sm text-gray-600">Procesado:</span>
                      <p className="text-sm">
                        {format(new Date(userData.accessRequest.processedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                      {userData.accessRequest.processor && (
                        <p className="text-xs text-gray-500">
                          Por: {userData.accessRequest.processor.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Information */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="orders" className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-3 rounded-none bg-transparent h-auto">
                <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Pedidos ({userData._count.orders})
                </TabsTrigger>
                <TabsTrigger value="addresses" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  Direcciones ({userData._count.addresses})
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500">
                  <Activity className="w-4 h-4 mr-2" />
                  Actividad Admin ({userData._count.processedRequests})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="orders" className="p-6">
              {userData.orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay pedidos registrados
                </div>
              ) : (
                <div className="space-y-4">
                  {userData.orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">Pedido #{order.id.slice(-8)}</h4>
                          {getOrderStatusBadge(order.status)}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${order.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        {order.items.length} productos: {order.items.map(item => 
                          `${item.product.name} (${item.quantity})`
                        ).join(', ')}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="addresses" className="p-6">
              {userData.addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay direcciones registradas
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{address.name}</h4>
                        {address.isDefault && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                            Predeterminada
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{address.street}</p>
                        <p>{address.commune}, {address.city}</p>
                        <p>{address.region}, {address.zipCode}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Phone className="w-3 h-3" />
                          <span>{address.phone}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Agregada: {format(new Date(address.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="p-6">
              {userData.processedRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No ha procesado solicitudes
                </div>
              ) : (
                <div className="space-y-4">
                  {userData.processedRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">Solicitud #{request.id.slice(-8)}</h4>
                          <p className="text-sm text-gray-600">
                            Usuario: {request.user.name} ({request.user.email})
                          </p>
                        </div>
                        <Badge variant="outline" className={
                          request.status === 'APPROVED' 
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Procesado: {format(new Date(request.processedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}