import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2'
import { GetObjectCommand } from '@aws-sdk/client-s3'

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
    
    // Get the object from R2
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: decodedKey,
    })

    const response = await r2Client.send(command)
    
    if (!response.Body) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Convert the stream to buffer
    const chunks = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
    let offset = 0
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.length
    }

    // Extract filename from key
    const filename = decodedKey.split('/').pop() || 'document'
    
    // Return the file with download headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Error al descargar el documento' },
      { status: 500 }
    )
  }
}