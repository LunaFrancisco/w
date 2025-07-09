import { NextRequest, NextResponse } from 'next/server'
import { generateDownloadUrl } from '@/lib/r2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const key = path.join('/')
    
    if (!key) {
      return NextResponse.json(
        { error: 'Path requerido' },
        { status: 400 }
      )
    }

    // Generate a presigned URL for secure access
    const downloadUrl = await generateDownloadUrl(key, 3600) // 1 hour expiry
    
    // Redirect to the presigned URL
    return NextResponse.redirect(downloadUrl)
    
  } catch (error) {
    console.error('Error generating image access URL:', error)
    return NextResponse.json(
      { error: 'Error al acceder a la imagen' },
      { status: 500 }
    )
  }
}