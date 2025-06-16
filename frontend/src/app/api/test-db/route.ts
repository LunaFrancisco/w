import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Simple query
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      success: true, 
      userCount,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}