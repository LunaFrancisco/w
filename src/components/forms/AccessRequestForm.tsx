'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import FileUpload from '@/components/ui/file-upload'
import { 
  UserPlus, 
  Send, 
  CheckCircle, 
  Mail, 
  Phone, 
  Building, 
  FileText,
  AlertCircle 
} from 'lucide-react'

const accessRequestSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
  email: z
    .string()
    .email('Por favor ingresa un email válido')
    .min(1, 'El email es requerido'),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .regex(/^[+\d\s()-]+$/, 'Por favor ingresa un teléfono válido'),
  company: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),
  position: z
    .string()
    .min(2, 'El cargo debe tener al menos 2 caracteres')
    .max(100, 'El cargo no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),
  reason: z
    .string()
    .min(20, 'Por favor explica tu motivación con al menos 20 caracteres')
    .max(500, 'El motivo no puede tener más de 500 caracteres'),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Debes aceptar los términos y condiciones'),
})

type AccessRequestFormData = z.infer<typeof accessRequestSchema>

export default function AccessRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AccessRequestFormData>({
    resolver: zodResolver(accessRequestSchema),
  })

  const acceptTerms = watch('acceptTerms')

  const onSubmit = async (data: AccessRequestFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString())
        }
      })

      // Add documents
      documents.forEach((file, index) => {
        formData.append(`document_${index}`, file)
      })

      const response = await fetch('/api/access-request', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al enviar la solicitud')
      }

      setSubmitSuccess(true)
      reset()
      setDocuments([])
      
      // Reset success message after 10 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 10000)
    } catch (error) {
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">
            ¡Solicitud enviada con éxito!
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Gracias por tu interés en unirte a Club W. Hemos recibido tu solicitud y 
            la revisaremos cuidadosamente. Te contactaremos por email dentro de los 
            próximos 3-5 días hábiles con la respuesta.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              <strong>Próximos pasos:</strong><br />
              1. Revisaremos tu solicitud y documentos<br />
              2. Te contactaremos por email con la decisión<br />
              3. Si eres aprobado, recibirás las instrucciones de acceso
            </p>
          </div>
          <Button 
            onClick={() => setSubmitSuccess(false)}
            className="gradient-green text-white border-0"
          >
            Enviar otra solicitud
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-2xl">Solicitud de Membresía</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Completa este formulario para solicitar tu acceso exclusivo a Club W. 
          Todas las solicitudes son revisadas cuidadosamente.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-primary" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground font-medium">
                  Nombre *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Tu nombre"
                  className={errors.firstName ? 'border-destructive focus:border-destructive' : ''}
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-sm text-destructive" role="alert">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground font-medium">
                  Apellido *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Tu apellido"
                  className={errors.lastName ? 'border-destructive focus:border-destructive' : ''}
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-sm text-destructive" role="alert">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className={`pl-10 ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">
                Teléfono *
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  className={`pl-10 ${errors.phone ? 'border-destructive focus:border-destructive' : ''}`}
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  {...register('phone')}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.phone && (
                <p id="phone-error" className="text-sm text-destructive" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Building className="w-5 h-5 mr-2 text-primary" />
              Información Profesional (Opcional)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-foreground font-medium">
                  Empresa
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Nombre de tu empresa"
                  className={errors.company ? 'border-destructive focus:border-destructive' : ''}
                  aria-invalid={errors.company ? 'true' : 'false'}
                  aria-describedby={errors.company ? 'company-error' : undefined}
                  {...register('company')}
                />
                {errors.company && (
                  <p id="company-error" className="text-sm text-destructive" role="alert">
                    {errors.company.message}
                  </p>
                )}
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position" className="text-foreground font-medium">
                  Cargo
                </Label>
                <Input
                  id="position"
                  type="text"
                  placeholder="Tu cargo o posición"
                  className={errors.position ? 'border-destructive focus:border-destructive' : ''}
                  aria-invalid={errors.position ? 'true' : 'false'}
                  aria-describedby={errors.position ? 'position-error' : undefined}
                  {...register('position')}
                />
                {errors.position && (
                  <p id="position-error" className="text-sm text-destructive" role="alert">
                    {errors.position.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground font-medium">
              ¿Por qué te interesa unirte a Club W? *
            </Label>
            <Textarea
              id="reason"
              placeholder="Cuéntanos qué te motiva a ser parte de Club W, qué esperas encontrar, y cómo planeas beneficiarte de la membresía..."
              rows={4}
              className={`resize-none ${errors.reason ? 'border-destructive focus:border-destructive' : ''}`}
              aria-invalid={errors.reason ? 'true' : 'false'}
              aria-describedby={errors.reason ? 'reason-error' : undefined}
              {...register('reason')}
            />
            {errors.reason && (
              <p id="reason-error" className="text-sm text-destructive" role="alert">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Documentos de Respaldo
            </h3>
            <p className="text-sm text-muted-foreground">
              Puedes adjuntar documentos que respalden tu solicitud (opcional): 
              CV, carta de recomendación, documento de identidad, etc.
            </p>
            
            <FileUpload
              maxFiles={3}
              maxSizeInMB={10}
              onFilesChange={setDocuments}
              disabled={isSubmitting}
            />
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                {...register('acceptTerms')}
              />
              <div className="flex-1">
                <Label htmlFor="acceptTerms" className="text-sm text-foreground">
                  Acepto los{' '}
                  <a href="/terminos-condiciones" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="/politica-privacidad" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    política de privacidad
                  </a>{' '}
                  de Club W. *
                </Label>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive mt-1" role="alert">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !acceptTerms}
            className="w-full gradient-green text-white border-0 py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando solicitud...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar solicitud de membresía
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-primary" />
              Proceso de Revisión
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Todas las solicitudes son revisadas manualmente</li>
              <li>• El proceso puede tomar entre 3-5 días hábiles</li>
              <li>• Te contactaremos por email con la decisión</li>
              <li>• La membresía está sujeta a aprobación del equipo de Club W</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}