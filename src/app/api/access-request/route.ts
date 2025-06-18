import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const accessRequestSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(8).regex(/^[+\d\s()-]+$/),
  company: z.string().max(100).optional().or(z.literal('')),
  position: z.string().max(100).optional().or(z.literal('')),
  reason: z.string().min(20).max(500),
  acceptTerms: z.string().transform(val => val === 'true'),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const formFields: Record<string, any> = {}
    const files: File[] = []
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('document_')) {
        files.push(value as File)
      } else {
        formFields[key] = value
      }
    }
    
    // Validate the form data
    const result = accessRequestSchema.safeParse(formFields)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos de formulario inválidos', details: result.error.errors },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, phone, company, position, reason, acceptTerms } = result.data

    if (!acceptTerms) {
      return NextResponse.json(
        { error: 'Debes aceptar los términos y condiciones' },
        { status: 400 }
      )
    }

    // Check if email already exists
    // TODO: Check in database if email already has a pending or approved request

    const documentUrls: string[] = []

    // Upload documents to Supabase Storage
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `access-requests/${fileName}`

        try {
          // Convert File to ArrayBuffer
          const arrayBuffer = await file.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer)

          const { data, error } = await supabase.storage
            .from('documents')
            .upload(filePath, uint8Array, {
              contentType: file.type,
              upsert: false,
            })

          if (error) {
            console.error('Supabase upload error:', error)
            throw new Error('Error al subir documento')
          }

          if (data) {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(filePath)
            
            documentUrls.push(urlData.publicUrl)
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError)
          return NextResponse.json(
            { error: 'Error al subir los documentos. Por favor, inténtalo de nuevo.' },
            { status: 500 }
          )
        }
      }
    }

    // TODO: Save to database using Prisma
    // This would typically involve:
    // 1. Creating a user record (if doesn't exist)
    // 2. Creating an access_request record
    // 3. Linking uploaded documents
    
    // For now, we'll just log the data
    console.log('Access request submission:', {
      firstName,
      lastName,
      email,
      phone,
      company: company || 'No especificada',
      position: position || 'No especificado',
      reason,
      documentUrls,
      timestamp: new Date().toISOString(),
    })

    // TODO: Send email notifications
    // 1. Confirmation email to applicant
    // 2. Notification email to admin

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json(
      { 
        success: true, 
        message: 'Solicitud enviada exitosamente. Te contactaremos pronto.',
        requestId: Math.random().toString(36).substring(2, 15),
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing access request:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor. Por favor, inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  )
}