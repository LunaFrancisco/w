import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ShoppingBag } from 'lucide-react'

export default function Error500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-9xl font-bold text-muted-foreground/20">500</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">Error del Servidor</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
            Algo salió mal en nuestros servidores. Por favor, inténtalo de nuevo más tarde.
          </p>
        </div>
        
        <Button className="gradient-green text-white border-0" asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Volver al Inicio
          </Link>
        </Button>
      </div>
    </div>
  )
}
