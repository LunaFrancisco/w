'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-muted-foreground/20">Error</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">¡Ups! Algo salió mal</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}