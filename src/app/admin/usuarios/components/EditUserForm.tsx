'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  ArrowLeft, 
  Save,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'CLIENT', 'PENDING']),
  image: z.string().url('URL inválida').optional().or(z.literal('')),
  emailVerified: z.boolean()
})

type FormData = z.infer<typeof formSchema>

interface EditUserFormProps {
  userId: string
  currentUserId: string
}

export default function EditUserForm({ userId, currentUserId }: EditUserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'CLIENT',
      image: '',
      emailVerified: false
    }
  })

  const { watch, setValue } = form
  const watchedValues = watch()

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
      const user = data.user
      
      // Populate form with existing data
      setValue('name', user.name || '')
      setValue('email', user.email || '')
      setValue('role', user.role || 'CLIENT')
      setValue('image', user.image || '')
      setValue('emailVerified', !!user.emailVerified)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast.error('Error al cargar el usuario')
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

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      const submitData = {
        name: data.name,
        email: data.email,
        role: data.role,
        image: data.image || undefined,
        emailVerified: data.emailVerified
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar usuario')
      }
      toast.success('Usuario actualizado exitosamente')
      router.push(`/admin/usuarios/${userId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al actualizar usuario: ${errorMessage}`)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuario</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
          <p className="text-gray-600 mt-2">
            Modifica la información del usuario
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

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current user preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Vista previa actual:</h3>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={watchedValues.image} alt={watchedValues.name} />
                  <AvatarFallback>{getInitials(watchedValues.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium text-lg">{watchedValues.name || 'Nombre del usuario'}</h4>
                    <p className="text-gray-600">{watchedValues.email || 'email@ejemplo.com'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(watchedValues.role)}
                    {watchedValues.emailVerified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                        Email verificado
                      </Badge>
                    )}
                    {userId === currentUserId && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                        Tú
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
                <Select value={watchedValues.role} onValueChange={(value) => setValue('role', value as FormData['role'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Cliente</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
                {userId === currentUserId && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Ten cuidado al cambiar tu propio rol
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailVerified">Estado del email</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailVerified"
                    checked={watchedValues.emailVerified}
                    onCheckedChange={(checked) => setValue('emailVerified', checked)}
                  />
                  <Label htmlFor="emailVerified" className="text-sm">
                    Email verificado
                  </Label>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
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
                <Label className="text-sm font-medium text-gray-700">Vista previa de imagen:</Label>
                <div className="mt-2">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={watchedValues.image} alt="Preview" />
                    <AvatarFallback>{getInitials(watchedValues.name || 'U')}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}