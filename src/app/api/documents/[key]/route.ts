import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateDownloadUrl } from '@/lib/r2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { key } = await params
    
    if (!key) {
      return NextResponse.json(
        { error: 'Clave de documento requerida' },
        { status: 400 }
      )
    }

    // Decode the key in case it's URL encoded
    const decodedKey = decodeURIComponent(key)
    
    // Check if this is a download request
    const { searchParams } = new URL(request.url)
    const download = searchParams.get('download') === 'true'
    
    // Generate a presigned URL for secure access
    const downloadUrl = await generateDownloadUrl(decodedKey, 3600) // 1 hour expiry
    
    if (download) {
      // For download, we redirect with download headers
      const response = NextResponse.redirect(downloadUrl)
      response.headers.set('Content-Disposition', 'attachment')
      return response
    } else {
      // For preview, just redirect
      return NextResponse.redirect(downloadUrl)
    }
    
  } catch (error) {
    console.error('Error generating document access URL:', error)
    return NextResponse.json(
      { error: 'Error al acceder al documento' },
      { status: 500 }
    )
  }
}