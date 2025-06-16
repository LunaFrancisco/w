import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AccessRequestActions from '@/components/AccessRequestActions'

export default async function AccessRequestsPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/unauthorized')
  }

  const accessRequests = await prisma.accessRequest.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      processedBy: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const pendingCount = accessRequests.filter(req => req.status === 'PENDING').length
  const approvedCount = accessRequests.filter(req => req.status === 'APPROVED').length
  const rejectedCount = accessRequests.filter(req => req.status === 'REJECTED').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Acceso</h1>
        <p className="text-gray-600 mt-2">
          Gestiona las solicitudes de acceso al club privado
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Aprobadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedCount}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Rechazadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          {accessRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay solicitudes de acceso
            </p>
          ) : (
            <div className="space-y-4">
              {accessRequests.map((request) => (
                <AccessRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AccessRequestCard({ request }: { request: any }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pendiente</Badge>
      case 'APPROVED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprobada</Badge>
      case 'REJECTED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rechazada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          {request.user.image && (
            <img
              src={request.user.image}
              alt={request.user.name}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <h3 className="font-medium text-gray-900">{request.user.name}</h3>
            <p className="text-sm text-gray-600">{request.user.email}</p>
          </div>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Fecha de solicitud:</span>
          <p className="font-medium">
            {new Date(request.createdAt).toLocaleDateString('es-ES', {
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
            <span className="text-gray-500">Procesada:</span>
            <p className="font-medium">
              {new Date(request.processedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {request.processedBy && (
              <p className="text-xs text-gray-500">Por: {request.processedBy.name}</p>
            )}
          </div>
        )}
      </div>

      {request.documents && request.documents.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Documentos adjuntos:</h4>
          <div className="flex flex-wrap gap-2">
            {request.documents.map((doc: string, index: number) => (
              <a
                key={index}
                href={doc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Documento {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {request.adminNotes && (
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Notas del administrador:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            {request.adminNotes}
          </p>
        </div>
      )}

      {request.status === 'PENDING' && (
        <AccessRequestActions requestId={request.id} />
      )}
    </div>
  )
}