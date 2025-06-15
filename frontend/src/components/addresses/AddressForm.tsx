'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  MapPin, 
  Save, 
  X, 
  Home, 
  Phone, 
  AlertCircle,
  CheckCircle
} from 'lucide-react'

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

interface AddressFormProps {
  address?: Address | null
  onSuccess: (address: Address) => void
  onCancel: () => void
}

const addressSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  street: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede tener más de 200 caracteres'),
  commune: z
    .string()
    .min(2, 'La comuna es requerida')
    .max(100, 'La comuna no puede tener más de 100 caracteres'),
  city: z
    .string()
    .min(2, 'La ciudad es requerida')
    .max(100, 'La ciudad no puede tener más de 100 caracteres'),
  region: z
    .string()
    .min(2, 'La región es requerida')
    .max(100, 'La región no puede tener más de 100 caracteres'),
  zipCode: z
    .string()
    .min(4, 'El código postal debe tener al menos 4 caracteres')
    .max(10, 'El código postal no puede tener más de 10 caracteres'),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .regex(/^[+\d\s()-]+$/, 'Por favor ingresa un teléfono válido'),
  isDefault: z.boolean().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

const CHILE_REGIONS = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana',
  'Región del Libertador General Bernardo O\'Higgins',
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región Aysén del General Carlos Ibáñez del Campo',
  'Región de Magallanes y de la Antártica Chilena',
]

const SANTIAGO_COMMUNES = [
  'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
  'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja',
  'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo',
  'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda',
  'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal',
  'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón',
  'Santiago Centro', 'Vitacura'
]

export default function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState(address?.region || 'Región Metropolitana')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: address?.name || '',
      street: address?.street || '',
      commune: address?.commune || '',
      city: address?.city || 'Santiago',
      region: address?.region || 'Región Metropolitana',
      zipCode: address?.zipCode || '',
      phone: address?.phone || '',
      isDefault: address?.isDefault || false,
    },
  })

  const watchRegion = watch('region')

  const onSubmit = async (data: AddressFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const url = address ? `/api/user/addresses/${address.id}` : '/api/user/addresses'
      const method = address ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar la dirección')
      }

      const savedAddress = await response.json()
      onSuccess(savedAddress)
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'Error al guardar la dirección. Por favor, inténtalo de nuevo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    setValue('region', region)
    
    // Auto-set city for Santiago Metropolitan Region
    if (region === 'Región Metropolitana') {
      setValue('city', 'Santiago')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                {address ? 'Editar Dirección' : 'Agregar Nueva Dirección'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Address Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Nombre de la dirección *
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ej: Casa, Oficina, Depto"
                    className={`pl-10 ${errors.name ? 'border-destructive focus:border-destructive' : ''}`}
                    {...register('name')}
                  />
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Street Address */}
              <div className="space-y-2">
                <Label htmlFor="street" className="text-foreground font-medium">
                  Dirección completa *
                </Label>
                <Input
                  id="street"
                  type="text"
                  placeholder="Ej: Av. Providencia 1234, Depto 567"
                  className={errors.street ? 'border-destructive focus:border-destructive' : ''}
                  {...register('street')}
                />
                {errors.street && (
                  <p className="text-sm text-destructive">{errors.street.message}</p>
                )}
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label htmlFor="region" className="text-foreground font-medium">
                  Región *
                </Label>
                <select
                  id="region"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  value={selectedRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  {...register('region')}
                >
                  {CHILE_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <p className="text-sm text-destructive">{errors.region.message}</p>
                )}
              </div>

              {/* City and Commune */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground font-medium">
                    Ciudad *
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Ej: Santiago"
                    className={errors.city ? 'border-destructive focus:border-destructive' : ''}
                    {...register('city')}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commune" className="text-foreground font-medium">
                    Comuna *
                  </Label>
                  {selectedRegion === 'Región Metropolitana' ? (
                    <select
                      id="commune"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      {...register('commune')}
                    >
                      <option value="">Seleccionar comuna</option>
                      {SANTIAGO_COMMUNES.map((commune) => (
                        <option key={commune} value={commune}>
                          {commune}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="commune"
                      type="text"
                      placeholder="Ingresa la comuna"
                      className={errors.commune ? 'border-destructive focus:border-destructive' : ''}
                      {...register('commune')}
                    />
                  )}
                  {errors.commune && (
                    <p className="text-sm text-destructive">{errors.commune.message}</p>
                  )}
                </div>
              </div>

              {/* Zip Code and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-foreground font-medium">
                    Código Postal *
                  </Label>
                  <Input
                    id="zipCode"
                    type="text"
                    placeholder="Ej: 7500000"
                    className={errors.zipCode ? 'border-destructive focus:border-destructive' : ''}
                    {...register('zipCode')}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium">
                    Teléfono de contacto *
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      className={`pl-10 ${errors.phone ? 'border-destructive focus:border-destructive' : ''}`}
                      {...register('phone')}
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Set as Default */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  {...register('isDefault')}
                />
                <Label htmlFor="isDefault" className="text-sm">
                  Establecer como dirección por defecto
                </Label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gradient-green text-white border-0"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {address ? 'Actualizar' : 'Guardar'} Dirección
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Información importante</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Asegúrate de que la dirección sea completa y correcta</p>
                  <p>• El teléfono será usado para coordinar la entrega</p>
                  <p>• Los costos de envío varían según la comuna</p>
                  <p>• Solo se puede tener una dirección por defecto</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}