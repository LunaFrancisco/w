'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Phone,
  Home,
  Star
} from 'lucide-react'
import Link from 'next/link'
import AddressForm from './AddressForm'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: 'ADMIN' | 'CLIENT' | 'PENDING'
}

interface Address {
  id: string
  name: string
  street: string
  commune: string
  city: string
  region: string
  zipCode: string
  phone: string
  isDefault: boolean
}

interface AddressesContentProps {
  user: User
}

export default function AddressesContent({ user }: AddressesContentProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAddresses = async () => {
    try {
      setError(null)
      const response = await fetch('/api/user/addresses')
      
      if (!response.ok) {
        throw new Error('Error al cargar las direcciones')
      }
      
      const data = await response.json()
      setAddresses(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowForm(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      return
    }

    setActionLoading(addressId)
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la dirección')
      }

      setAddresses(addresses.filter(addr => addr.id !== addressId))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar la dirección')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    setActionLoading(addressId)
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Error al establecer dirección por defecto')
      }

      // Update local state
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al establecer dirección por defecto')
    } finally {
      setActionLoading(null)
    }
  }

  const handleFormSuccess = (savedAddress: Address) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(addresses.map(addr => 
        addr.id === savedAddress.id ? savedAddress : addr
      ))
    } else {
      // Add new address
      setAddresses([...addresses, savedAddress])
    }
    
    setShowForm(false)
    setEditingAddress(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <AddressForm
        address={editingAddress}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/perfil">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Perfil
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mis Direcciones</h1>
              <p className="text-muted-foreground">Gestiona tus direcciones de envío</p>
            </div>
          </div>
          <Button onClick={handleAddAddress} className="gradient-green text-white border-0">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Dirección
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes direcciones guardadas</h3>
                <p className="text-muted-foreground mb-6">
                  Agrega una dirección de envío para realizar tus pedidos
                </p>
                <Button onClick={handleAddAddress} className="gradient-green text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primera Dirección
                </Button>
              </CardContent>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className={`relative ${address.isDefault ? 'ring-2 ring-emerald-200 bg-emerald-50/50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Home className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-semibold">{address.name}</h3>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <Star className="w-3 h-3 mr-1" />
                            Por defecto
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-muted-foreground">
                        <p>{address.street}</p>
                        <p>{address.commune}, {address.city}</p>
                        <p>{address.region}, {address.zipCode}</p>
                        <div className="flex items-center space-x-2 pt-2">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{address.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          disabled={actionLoading === address.id}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          {actionLoading === address.id ? (
                            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={actionLoading === address.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {actionLoading === address.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Sobre las direcciones de envío</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Puedes tener múltiples direcciones guardadas para mayor comodidad</p>
                  <p>• La dirección marcada como "por defecto" se usará automáticamente en nuevos pedidos</p>
                  <p>• Solo puedes eliminar direcciones que no sean la dirección por defecto</p>
                  <p>• Los costos de envío pueden variar según la comuna de destino</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}