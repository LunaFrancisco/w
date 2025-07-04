import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const accessRequestSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(8).regex(/^[+\d\s()-]+$/),
  company: z.string().max(100).optional().or(z.literal('')),
  position: z.string().max(100).optional().or(z.literal('')),
  reason: z.string().min(20).max(500),
  acceptTerms: z.string().transform(val => val === 'true'),
  documents: z.array(z.object({
    key: z.string(),
    url: z.string(),
    filename: z.string(),
    contentType: z.string(),
    size: z.number(),
  })).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the form data
    const result = accessRequestSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos de formulario inválidos', details: result.error.errors },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, phone, company, position, reason, acceptTerms, documents } = result.data

    if (!acceptTerms) {
      return NextResponse.json(
        { error: 'Debes aceptar los términos y condiciones' },
        { status: 400 }
      )
    }

    // Validate that at least one document is uploaded
    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'Debes subir al menos un documento' },
        { status: 400 }
      )
    }

    if (documents.length > 3) {
      return NextResponse.json(
        { error: 'No puedes subir más de 3 documentos' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingRequest = await prisma.accessRequest.findFirst({
      where: {
        user: {
          email: email
        },
        status: {
          in: ['PENDING', 'APPROVED']
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Ya existe una solicitud pendiente o aprobada para este email' },
        { status: 400 }
      )
    }

    // Create or get user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Create new user with PENDING role and personal info
      user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          role: 'PENDING',
          emailVerified: new Date(), // Since they're submitting a request
        }
      })
    } else {
      // Update user name if it's different
      if (user.name !== `${firstName} ${lastName}`) {
        user = await prisma.user.update({
          where: { email },
          data: {
            name: `${firstName} ${lastName}`,
          }
        })
      }
    }

    // Create access request
    const accessRequest = await prisma.accessRequest.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        phone,
        company: company || null,
        position: position || null,
        reason,
        documents: documents.map(doc => ({
          key: doc.key,
          url: doc.url,
          filename: doc.filename,
          contentType: doc.contentType,
          size: doc.size,
        })),
      }
    })

    // Log the submission
    console.log(`✅ Access request created: ${accessRequest.id} for ${email} (${documents.length} documents)`)

    // TODO: Send email notifications
    // 1. Confirmation email to applicant
    // 2. Notification email to admin

    return NextResponse.json(
      { 
        success: true, 
        message: 'Solicitud enviada exitosamente. Te contactaremos pronto.',
        requestId: accessRequest.id,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Access request error:', error)
    
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