'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import AccessRequestActions from '@/components/AccessRequestActions'
import DocumentPreview from '@/components/DocumentPreview'
import { 
  RefreshCw, 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Shield,
  Plus,
  Edit
} from 'lucide-react'

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
    createdAt: string
    role: string
  }
  processor?: {
    name: string
    email: string
  }
}

export default function AccessRequestDetailPage() {
  const params = useParams()
  const [request, setRequest] = useState<AccessRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false)

  const requestId = params.id as string

  useEffect(() => {
    if (requestId) {
      fetchRequest()
    }
  }, [requestId])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/access-requests/${requestId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Solicitud no encontrada')
        } else {
          throw new Error('Error al cargar la solicitud')
        }
        return
      }
      
      const data = await response.json()
      setRequest(data.request)
    } catch (error) {
      console.error('Error fetching request:', error)
      setError('Error al cargar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestUpdate = () => {
    fetchRequest()
  }

  const handleUpdateNotes = async () => {
    setIsUpdatingNotes(true)
    
    try {
      const response = await fetch('/api/admin/access-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request?.id,
          adminNotes: notes,
          updateNotesOnly: true
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar las notas')
      }

      // Refresh the request data
      await fetchRequest()
      setIsEditingNotes(false)
      setNotes('')
      
    } catch (error) {
      console.error('Error updating notes:', error)
      setError('Error al actualizar las notas')
    } finally {
      setIsUpdatingNotes(false)
    }
  }

  const handleEditNotes = () => {
    setNotes(request?.adminNotes || '')
    setIsEditingNotes(true)
  }

  const handleCancelEdit = () => {
    setIsEditingNotes(false)
    setNotes('')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        label: 'Pendiente', 
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <Clock className="h-4 w-4" />
      },
      APPROVED: { 
        label: 'Aprobada', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-4 w-4" />
      },
      REJECTED: { 
        label: 'Rechazada', 
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="h-4 w-4" />
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { 
                    label: status, 
                    className: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <AlertTriangle className="h-4 w-4" />
                  }

    return (
      <Badge variant="secondary" className={`${config.className} border font-medium flex items-center gap-2`}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: 'Administrador', className: 'bg-purple-100 text-purple-800' },
      CLIENT: { label: 'Cliente', className: 'bg-blue-100 text-blue-800' },
      GUEST: { label: 'Invitado', className: 'bg-gray-100 text-gray-800' },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || 
                  { label: role, className: 'bg-gray-100 text-gray-800' }

    return (
      <Badge variant="outline" className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    )
  }

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
        <div className="flex items-center gap-4">
          <Link href="/admin/solicitudes">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Error</h1>
            <p className="text-gray-600 mt-2">No se pudo cargar la solicitud</p>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
              <button 
                onClick={fetchRequest}
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

  if (!request) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/solicitudes">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="h-8 w-8 text-blue-600" />
            Solicitud de Acceso
          </h1>
          <p className="text-gray-600 mt-2">
            Detalles de la solicitud #{request.id.slice(-8)}
          </p>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getStatusBadge(request.status)}
          <span className="text-sm text-gray-500">
            ID: {request.id.slice(-8)}
          </span>
        </div>
        {request.status === 'PENDING' && (
          <AccessRequestActions 
            requestId={request.id} 
            onUpdate={handleRequestUpdate}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {request.user.image && (
                  <img
                    src={request.user.image}
                    alt={request.user.name}
                    className="w-16 h-16 rounded-full border-2 border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {request.user.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{request.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    {getRoleBadge(request.user.role)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Fecha de registro
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900">
                      {new Date(request.user.createdAt).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    ID de usuario
                  </label>
                  <p className="text-gray-900 mt-1 font-mono text-sm">
                    {request.user.id.slice(-8)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {request.documents && request.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos Adjuntos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {request.documents.map((doc, index: number) => (
                    <DocumentPreview
                      key={index}
                      document={doc}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas del Administrador
                </CardTitle>
                {!isEditingNotes && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleEditNotes}
                  >
                    {request.adminNotes ? (
                      <>
                        <Edit className="h-4 w-4" />
                        Editar notas
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Añadir notas
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-4">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Añade notas sobre esta solicitud..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleUpdateNotes}
                      disabled={isUpdatingNotes}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdatingNotes ? 'Guardando...' : 'Guardar notas'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={isUpdatingNotes}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {request.adminNotes ? (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {request.adminNotes}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-dashed">
                      <p className="text-gray-500 text-center">
                        No hay notas del administrador para esta solicitud
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Cronología
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Solicitud creada
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {request.processedAt && (
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      request.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {request.status === 'APPROVED' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Solicitud {request.status === 'APPROVED' ? 'aprobada' : 'rechazada'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.processedAt).toLocaleString('es-CL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {request.processor && (
                        <p className="text-sm text-gray-500 mt-1">
                          Por: {request.processor.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}