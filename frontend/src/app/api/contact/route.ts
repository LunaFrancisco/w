import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  subject: z.string().min(5).max(150),
  message: z.string().min(10).max(1000),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const result = contactSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos de formulario inválidos', details: result.error.errors },
        { status: 400 }
      )
    }

    const { name, email, phone, subject, message } = result.data

    // TODO: Here you would typically:
    // 1. Save to database (contact_requests table)
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    
    // For now, we'll just log and return success
    console.log('Contact form submission:', {
      name,
      email,
      phone: phone || 'No proporcionado',
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real implementation, you would:
    // 1. Save to database using Prisma
    // 2. Send emails using Resend or similar service
    // 3. Return appropriate success/error responses

    return NextResponse.json(
      { 
        success: true, 
        message: 'Mensaje enviado exitosamente. Te contactaremos pronto.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing contact form:', error)
    
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