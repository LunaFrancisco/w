import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_PREFIXES } from '@/lib/storage';
import { r2Client, R2_BUCKET_NAME, generateFileKey } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const prefix = formData.get('prefix') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!prefix || !Object.values(STORAGE_PREFIXES).includes(prefix as any)) {
      return NextResponse.json(
        { error: 'Invalid prefix' },
        { status: 400 }
      );
    }
    
    // Generate unique key
    const key = generateFileKey(prefix, file.name);
    console.log(`📤 Uploading: ${file.name} → ${key}`);
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload directly to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });
    
    await r2Client.send(command);
    
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    console.log(`✅ Uploaded: ${file.name}`);
    
    return NextResponse.json({
      key,
      url: publicUrl,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    });
    
  } catch (error) {
    console.error('❌ Upload error:', File?.name || 'unknown', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}