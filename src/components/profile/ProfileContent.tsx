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
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Settings,
  MapPin,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: 'ADMIN' | 'CLIENT' | 'PENDING'
}

interface ProfileContentProps {
  user: User
}

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  email: z
    .string()
    .email('Por favor ingresa un email válido'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileContent({ user }: ProfileContentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setUpdateError(null)
    setUpdateSuccess(false)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil')
      }

      setUpdateSuccess(true)
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false)
      }, 3000)
    } catch (error) {
      setUpdateError(
        error instanceof Error 
          ? error.message 
          : 'Error al actualizar el perfil. Por favor, inténtalo de nuevo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrador', color: 'bg-purple-100 text-purple-800' }
      case 'CLIENT':
        return { label: 'Cliente Premium', color: 'bg-green-100 text-green-800' }
      case 'PENDING':
        return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' }
      default:
        return { label: 'Usuario', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const roleDisplay = getRoleDisplay(user.role)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            Cerrar Sesión
          </Button>
        </div>

        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name || 'Usuario'} 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">
                    {user.name || 'Usuario Sin Nombre'}
                  </h1>
                  <p className="text-muted-foreground mb-2">{user.email}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleDisplay.color}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {roleDisplay.label}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/perfil/direcciones">
                <MapPin className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Direcciones</p>
                  <p className="text-sm text-muted-foreground">Gestionar direcciones de envío</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/pedidos">
                <Package className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Mis Pedidos</p>
                  <p className="text-sm text-muted-foreground">Historial de compras</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/dashboard">
                <Settings className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Dashboard</p>
                  <p className="text-sm text-muted-foreground">Panel principal</p>
                </div>
              </Link>
            </Button>
          </div>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Success Message */}
                {updateSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-700">
                      Perfil actualizado exitosamente
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {updateError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700">{updateError}</p>
                  </div>
                )}

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    className={errors.name ? 'border-destructive focus:border-destructive' : ''}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className={`pl-10 ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
                      {...register('email')}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    El email está asociado a tu cuenta de Google y se usa para las notificaciones.
                  </p>
                </div>

                {/* Account Info - Read Only */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-medium">Información de la Cuenta</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Rol de Usuario
                      </Label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleDisplay.color}`}>
                          {roleDisplay.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Método de Autenticación
                      </Label>
                      <div className="mt-1 flex items-center space-x-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span className="text-sm">Google SSO</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading || !isDirty}
                    className="gradient-green text-white border-0 px-8"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Zona Peligrosa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Cerrar Sesión</h4>
                  <p className="text-sm text-red-700">
                    Cerrar sesión en este dispositivo
                  </p>
                </div>
                <Button variant="destructive" onClick={handleSignOut}>
                  Cerrar Sesión
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Soporte</h4>
                  <p className="text-sm text-red-700">
                    ¿Necesitas ayuda o tienes problemas con tu cuenta?
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/contacto">
                    Contactar Soporte
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}