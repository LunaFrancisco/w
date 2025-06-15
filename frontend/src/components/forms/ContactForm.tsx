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
import { Mail, MessageSquare, Phone, Send, CheckCircle } from 'lucide-react'

const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  email: z
    .string()
    .email('Por favor ingresa un email válido')
    .min(1, 'El email es requerido'),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .regex(/^[+\d\s()-]+$/, 'Por favor ingresa un teléfono válido')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(150, 'El asunto no puede tener más de 150 caracteres'),
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede tener más de 1000 caracteres'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error al enviar el mensaje')
      }

      setSubmitSuccess(true)
      reset()
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.'
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
            ¡Mensaje enviado con éxito!
          </h3>
          <p className="text-muted-foreground mb-6">
            Gracias por contactarnos. Nos pondremos en contacto contigo dentro de las próximas 24 horas.
          </p>
          <Button 
            onClick={() => setSubmitSuccess(false)}
            className="gradient-green text-white border-0"
          >
            Enviar otro mensaje
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
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-2xl">Contáctanos</CardTitle>
        </div>
        <p className="text-muted-foreground">
          ¿Tienes alguna pregunta sobre Club W? Estamos aquí para ayudarte.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Nombre completo *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre completo"
              className={errors.name ? 'border-destructive focus:border-destructive' : ''}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
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

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground font-medium">
              Teléfono (opcional)
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

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-foreground font-medium">
              Asunto *
            </Label>
            <Input
              id="subject"
              type="text"
              placeholder="¿En qué podemos ayudarte?"
              className={errors.subject ? 'border-destructive focus:border-destructive' : ''}
              aria-invalid={errors.subject ? 'true' : 'false'}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
              {...register('subject')}
            />
            {errors.subject && (
              <p id="subject-error" className="text-sm text-destructive" role="alert">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground font-medium">
              Mensaje *
            </Label>
            <Textarea
              id="message"
              placeholder="Cuéntanos más detalles sobre tu consulta..."
              rows={5}
              className={`resize-none ${errors.message ? 'border-destructive focus:border-destructive' : ''}`}
              aria-invalid={errors.message ? 'true' : 'false'}
              aria-describedby={errors.message ? 'message-error' : undefined}
              {...register('message')}
            />
            {errors.message && (
              <p id="message-error" className="text-sm text-destructive" role="alert">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gradient-green text-white border-0 py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar mensaje
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Al enviar este formulario, aceptas que Club W se ponga en contacto contigo 
            para responder tu consulta.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}