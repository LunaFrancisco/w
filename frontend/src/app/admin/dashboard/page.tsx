import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/unauthorized')
  }

  // Fetch admin stats
  const stats = await getAdminStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen general del sistema y métricas clave
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsers}
          subtitle={`${stats.pendingUsers} pendientes`}
          icon="👥"
        />
        <StatCard
          title="Pedidos Hoy"
          value={stats.ordersToday}
          subtitle={`$${stats.revenueToday.toLocaleString()}`}
          icon="📦"
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts}
          subtitle={`${stats.lowStockProducts} con poco stock`}
          icon="📦"
        />
        <StatCard
          title="Solicitudes"
          value={stats.pendingRequests}
          subtitle="esperando aprobación"
          icon="📋"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={stats.recentOrders} />
        <PendingRequests requests={stats.recentRequests} />
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon }: {
  title: string
  value: number
  subtitle: string
  icon: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <span className="text-2xl">{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}

function RecentOrders({ orders }: { orders: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay pedidos recientes</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">#{order.id.slice(-8)}</p>
                <p className="text-xs text-gray-600">{order.user.name}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">${order.total}</p>
                <p className="text-xs text-gray-600">{order.status}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function PendingRequests({ requests }: { requests: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes Pendientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay solicitudes pendientes</p>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">{request.user.name}</p>
                <p className="text-xs text-gray-600">{request.user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

async function getAdminStats() {
  const [
    totalUsers,
    pendingUsers,
    totalProducts,
    lowStockProducts,
    pendingRequests,
    ordersToday,
    revenueToday,
    recentOrders,
    recentRequests
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Pending users
    prisma.user.count({ where: { role: 'PENDING' } }),
    
    // Total products
    prisma.product.count({ where: { active: true } }),
    
    // Low stock products (less than 10)
    prisma.product.count({ 
      where: { 
        active: true, 
        stock: { lt: 10 } 
      } 
    }),
    
    // Pending access requests
    prisma.accessRequest.count({ 
      where: { status: 'PENDING' } 
    }),
    
    // Orders today
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    
    // Revenue today
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        },
        status: { not: 'CANCELLED' }
      },
      _sum: { total: true }
    }).then((result: any) => result._sum.total || 0),
    
    // Recent orders (last 5)
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    }),
    
    // Recent access requests (last 5)
    prisma.accessRequest.findMany({
      where: { status: 'PENDING' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    })
  ])

  return {
    totalUsers,
    pendingUsers,
    totalProducts,
    lowStockProducts,
    pendingRequests,
    ordersToday,
    revenueToday: Number(revenueToday),
    recentOrders,
    recentRequests
  }
}