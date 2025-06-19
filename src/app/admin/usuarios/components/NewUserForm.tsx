'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  MapPin, 
  FileText, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormStepper, Step } from '@/components/ui/form-stepper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const steps: Step[] = [
  {
    id: 'basic',
    title: 'Información Básica',
    description: 'Datos personales del usuario',
    icon: <User className="w-5 h-5" />
  },
  {
    id: 'address',
    title: 'Dirección',
    description: 'Dirección de envío (opcional)',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'review',
    title: 'Revisar',
    description: 'Confirmar información',
    icon: <Check className="w-5 h-5" />
  }
]

const formSchema = z.object({
  // Información básica
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'CLIENT', 'PENDING']),
  image: z.string().url('URL inválida').optional().or(z.literal('')),
  
  // Dirección (opcional)
  includeAddress: z.boolean(),
  address: z.object({
    name: z.string().min(2, 'Nombre requerido'),
    street: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
    commune: z.string().min(2, 'Comuna requerida'),
    city: z.string().min(2, 'Ciudad requerida'),
    region: z.string().min(2, 'Región requerida'),
    zipCode: z.string().min(3, 'Código postal requerido'),
    phone: z.string().min(8, 'Teléfono debe tener al menos 8 dígitos')
  }).optional(),
  
  // Notas administrativas
  adminNotes: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

export default function NewUserForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'CLIENT',
      image: '',
      includeAddress: false,
      address: {
        name: '',
        street: '',
        commune: '',
        city: '',
        region: '',
        zipCode: '',
        phone: ''
      },
      adminNotes: ''
    }
  })

  const { watch, setValue } = form
  const watchedValues = watch()
  const includeAddress = watch('includeAddress')

  const regions = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
    'Valparaíso', 'Región Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble',
    'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const validateCurrentStep = () => {
    const values = form.getValues()
    
    switch (currentStep) {
      case 0: // Basic info
        return values.name && values.email && values.role
      case 1: // Address
        if (!includeAddress) return true
        return values.address && 
               values.address.name && 
               values.address.street && 
               values.address.commune && 
               values.address.city && 
               values.address.region && 
               values.address.zipCode && 
               values.address.phone
      case 2: // Review
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      const submitData = {
        name: data.name,
        email: data.email,
        role: data.role,
        image: data.image || undefined,
        address: data.includeAddress ? data.address : undefined,
        adminNotes: data.adminNotes || undefined
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear usuario')
      }

      toast.success('Usuario creado exitosamente')
      router.push('/admin/usuarios')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al crear usuario: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: 'Administrador', className: 'bg-purple-100 text-purple-800' },
      CLIENT: { label: 'Cliente', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Pendiente', className: 'bg-orange-100 text-orange-800' },
    }
    
    const config = roleConfig[role as keyof typeof roleConfig]
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agregar Usuario</h1>
          <p className="text-gray-600 mt-2">
            Crea un nuevo usuario en el sistema paso a paso
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      </div>

      {/* Stepper */}
      <FormStepper 
        steps={steps} 
        currentStep={currentStep}
        className="mb-8"
      />

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Step 0: Basic Information */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Juan Pérez"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Select value={watchedValues.role} onValueChange={(value: 'ADMIN' | 'CLIENT' | 'PENDING') => setValue('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">Cliente</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">URL de imagen (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      {...form.register('image')}
                    />
                    {watchedValues.image && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImagePreview(!showImagePreview)}
                      >
                        {showImagePreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                  {form.formState.errors.image && (
                    <p className="text-sm text-red-600">{form.formState.errors.image.message}</p>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {watchedValues.image && showImagePreview && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-700">Vista previa:</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={watchedValues.image} alt="Preview" />
                      <AvatarFallback>{getInitials(watchedValues.name || 'U')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{watchedValues.name || 'Nombre del usuario'}</p>
                      <p className="text-sm text-gray-600">{watchedValues.email || 'email@ejemplo.com'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 1: Address */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeAddress"
                  checked={includeAddress}
                  onChange={(e) => setValue('includeAddress', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeAddress">Agregar dirección de envío</Label>
              </div>

              {includeAddress && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="addressName">Nombre para la dirección *</Label>
                      <Input
                        id="addressName"
                        placeholder="Ej: Casa, Oficina"
                        {...form.register('address.name')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        placeholder="+56 9 1234 5678"
                        {...form.register('address.phone')}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="street">Dirección completa *</Label>
                      <Input
                        id="street"
                        placeholder="Calle, número, depto/casa"
                        {...form.register('address.street')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commune">Comuna *</Label>
                      <Input
                        id="commune"
                        placeholder="Ej: Las Condes"
                        {...form.register('address.commune')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        placeholder="Ej: Santiago"
                        {...form.register('address.city')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Región *</Label>
                      <Select 
                        value={watchedValues.address?.region} 
                        onValueChange={(value) => setValue('address.region', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar región" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Código Postal *</Label>
                      <Input
                        id="zipCode"
                        placeholder="Ej: 7500000"
                        {...form.register('address.zipCode')}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Revisar Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Vista previa del usuario:</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={watchedValues.image} alt={watchedValues.name} />
                    <AvatarFallback>{getInitials(watchedValues.name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-lg">{watchedValues.name}</h4>
                      <p className="text-gray-600">{watchedValues.email}</p>
                    </div>
                    <div>
                      {getRoleBadge(watchedValues.role)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Preview */}
              {includeAddress && watchedValues.address && (
                <>
                  <Separator />
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Dirección de envío:</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>{watchedValues.address.name}</strong></p>
                      <p>{watchedValues.address.street}</p>
                      <p>{watchedValues.address.commune}, {watchedValues.address.city}</p>
                      <p>{watchedValues.address.region}, {watchedValues.address.zipCode}</p>
                      <p>Tel: {watchedValues.address.phone}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Notas administrativas (opcional)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Notas internas sobre este usuario..."
                  rows={3}
                  {...form.register('adminNotes')}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              type="submit"
              disabled={isSubmitting || !validateCurrentStep()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Crear Usuario
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!validateCurrentStep()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}