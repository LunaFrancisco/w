'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import AccessRequestActions from '@/components/AccessRequestActions'
import { RefreshCw, Users, AlertTriangle, Search, Clock, CheckCircle, XCircle } from 'lucide-react'

interface AccessRequest {
  id: string
  status: string
  createdAt: string
  processedAt?: string
  adminNotes?: string
  documents?: string[]
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
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
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

      {/* Filters */}
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

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Solicitudes ({filteredRequests.length})
            {searchTerm && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (filtrado por "{searchTerm}")
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
            <div className="space-y-6">
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

      {/* Pagination */}
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
      PENDING: { label: 'Pendiente', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      APPROVED: { label: 'Aprobada', className: 'bg-green-100 text-green-800 border-green-200' },
      REJECTED: { label: 'Rechazada', className: 'bg-red-100 text-red-800 border-red-200' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' }

    return (
      <Badge variant="secondary" className={`${config.className} border font-medium`}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="border rounded-xl p-6 space-y-4 hover:shadow-lg transition-all bg-white border-gray-200">
      <div className="flex items-start justify-between">
        <Link 
          href={`/admin/solicitudes/${request.id}`}
          className="flex items-center space-x-4 flex-1 cursor-pointer group"
        >
          {request.user.image && (
            <img
              src={request.user.image}
              alt={request.user.name}
              className="w-12 h-12 rounded-full border"
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
              {request.user.name}
            </h3>
            <p className="text-sm text-gray-600">{request.user.email}</p>
          </div>
        </Link>
        {getStatusBadge(request.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 font-medium">Fecha de solicitud:</span>
          <p className="font-medium mt-1">
            {new Date(request.createdAt).toLocaleDateString('es-CL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        {request.processedAt && (
          <div>
            <span className="text-gray-500 font-medium">Procesada:</span>
            <p className="font-medium mt-1">
              {new Date(request.processedAt).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {request.processor && (
              <p className="text-xs text-gray-500 mt-1">Por: {request.processor.name}</p>
            )}
          </div>
        )}
      </div>

      {request.documents && request.documents.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Documentos adjuntos:</h4>
          <div className="flex flex-wrap gap-2">
            {request.documents.map((doc: string, index: number) => (
              <a
                key={index}
                href={doc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                Documento {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {request.adminNotes && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Notas del administrador:</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
            {request.adminNotes}
          </p>
        </div>
      )}

      {request.status === 'PENDING' && (
        <div className="pt-4 border-t">
          <AccessRequestActions requestId={request.id} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  )
}