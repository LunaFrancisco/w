'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { AccessRequestsDataTable } from '@/components/admin/AccessRequestsDataTable'
import AccessRequestActions from '@/components/AccessRequestActions'
import { RefreshCw, Users, AlertTriangle, Search, Clock, CheckCircle, XCircle, Table, Grid, Calendar, FileText, Eye } from 'lucide-react'

interface AccessRequest {
  id: string
  status: string
  createdAt: string
  processedAt?: string
  adminNotes?: string
  documents?: Array<{
    key: string
    url: string
    filename: string
    contentType: string
    size: number
  }>
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  processor?: {
    name: string
  }
}

interface RequestsData {
  requests: AccessRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  error?: string
  fallback?: boolean
}

export default function AccessRequestsPage() {
  const [requestsData, setRequestsData] = useState<RequestsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchRequests()
  }, [statusFilter, currentPage])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('page', currentPage.toString())
      params.append('limit', '20')
      
      const response = await fetch(`/api/admin/access-requests?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar solicitudes')
      }
      
      const data = await response.json()
      setRequestsData(data)
      
      if (data.fallback) {
        setError(data.error || 'Datos no disponibles temporalmente')
      }
    } catch (error) {
      console.error('Error fetching access requests:', error)
      setError('Error al cargar las solicitudes de acceso')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestUpdate = () => {
    fetchRequests() // Refresh the list after an update
  }

  // Filter requests by search term
  const filteredRequests = requestsData?.requests.filter(request =>
    request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Calculate stats from current data
  const stats = requestsData ? {
    pending: requestsData.requests.filter(req => req.status === 'PENDING').length,
    approved: requestsData.requests.filter(req => req.status === 'APPROVED').length,
    rejected: requestsData.requests.filter(req => req.status === 'REJECTED').length,
    total: requestsData.requests.length
  } : { pending: 0, approved: 0, rejected: 0, total: 0 }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-50 border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-8" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Acceso</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las solicitudes de acceso al club privado
          </p>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
              <button 
                onClick={fetchRequests}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Solicitudes de Acceso
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las solicitudes de acceso al club privado
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Warning Banner if using fallback data */}
      {requestsData?.fallback && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p>Los datos mostrados son temporales. La base de datos no está disponible.</p>
              <button 
                onClick={fetchRequests}
                className="ml-auto px-3 py-1 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<Users className="h-5 w-5" />}
          color="gray"
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon={<Clock className="h-5 w-5" />}
          color="orange"
          warning={stats.pending > 0}
        />
        <StatCard
          title="Aprobadas"
          value={stats.approved}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejected}
          icon={<XCircle className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="table" className="w-full">

        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Vista Tabla
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Vista Tarjetas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="space-y-4">
          <AccessRequestsDataTable 
            requests={requestsData?.requests || []}
            onUpdate={handleRequestUpdate}
          />
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          {/* Filters for Cards View */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Buscar solicitudes
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Nombre o email del usuario..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Estado
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="APPROVED">Aprobada</SelectItem>
                      <SelectItem value="REJECTED">Rechazada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Solicitudes ({filteredRequests.length})
                {searchTerm && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                  (filtrado por &quot;{searchTerm}&quot;)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm || statusFilter !== 'all' ? 'No se encontraron solicitudes con los filtros aplicados' : 'No hay solicitudes de acceso'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredRequests.map((request) => (
                    <AccessRequestCard 
                      key={request.id} 
                      request={request} 
                      onUpdate={handleRequestUpdate}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination for Cards View */}
          {requestsData && requestsData.pagination.pages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Página {requestsData.pagination.page} de {requestsData.pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === requestsData.pagination.pages}
                      onClick={() => setCurrentPage(prev => Math.min(requestsData.pagination.pages, prev + 1))}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, icon, color, warning }: {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  warning?: boolean
}) {
  const colorClasses = {
    gray: { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    green: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    red: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  }

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray
  const cardClass = warning 
    ? 'bg-orange-50 border-orange-200' 
    : `${colors.bg} ${colors.border}`

  return (
    <Card className={`${cardClass} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <div className={warning ? 'text-orange-600' : colors.text}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${warning ? 'text-orange-600' : 'text-gray-900'}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function AccessRequestCard({ request, onUpdate }: { 
  request: AccessRequest
  onUpdate: () => void 
}) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        label: 'Pendiente', 
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <Clock className="h-3 w-3" />
      },
      APPROVED: { 
        label: 'Aprobada', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-3 w-3" />
      },
      REJECTED: { 
        label: 'Rechazada', 
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="h-3 w-3" />
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200', icon: null }

    return (
      <Badge variant="secondary" className={`${config.className} border font-medium flex items-center gap-1.5 px-3 py-1`}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200/60 shadow-md bg-gradient-to-br from-white to-gray-50/50 hover:border-gray-300/80">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with user info and status */}
          <div className="flex items-start justify-between">
            <Link 
              href={`/admin/solicitudes/${request.id}`}
              className="flex items-center space-x-3 flex-1 cursor-pointer group"
            >
              <div className="relative">
                {request.user.image ? (
                  <img
                    src={request.user.image}
                    alt={request.user.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {request.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors truncate">
                  {request.user.name}
                </h3>
                <p className="text-sm text-gray-600 truncate">{request.user.email}</p>
              </div>
            </Link>
            {getStatusBadge(request.status)}
          </div>

          {/* Key information grid */}
          <div className="bg-white/80 rounded-lg p-4 space-y-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Solicitado:</span>
              </div>
              <span className="font-semibold text-gray-900">
                {formatDateTime(request.createdAt)}
              </span>
            </div>
            
            {request.processedAt && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Procesado:</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900 block">
                    {formatDate(request.processedAt)}
                  </span>
                  {request.processor && (
                    <span className="text-xs text-gray-500">
                      Por: {request.processor.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {request.documents && request.documents.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Documentos:</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {request.documents.length} archivo{request.documents.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Admin notes if present */}
          {request.adminNotes && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Notas del administrador:</span>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                {request.adminNotes}
              </p>
            </div>
          )}

          {/* Actions for pending requests */}
          {request.status === 'PENDING' && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Link 
                href={`/admin/solicitudes/${request.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Ver detalles
              </Link>
              <div className="flex gap-2">
                <AccessRequestActions requestId={request.id} onUpdate={onUpdate} compact />
              </div>
            </div>
          )}

          {/* View details link for processed requests */}
          {request.status !== 'PENDING' && (
            <div className="pt-4 border-t border-gray-200">
              <Link 
                href={`/admin/solicitudes/${request.id}`}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Eye className="h-4 w-4" />
                Ver detalles completos
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}