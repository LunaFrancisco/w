'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreateCategoryForm } from './CreateCategoryForm'
import { useRouter } from 'next/navigation'

export function CreateCategoryButton() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const router = useRouter()

  const handleCategoryCreated = (category: any) => {
    // Refresh the page to show the new category
    router.refresh()
  }

  return (
    <>
      <Button
        onClick={() => setIsFormOpen(true)}
        size="lg"
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      >
        + Crear Categoría
      </Button>
      
      <CreateCategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleCategoryCreated}
      />
    </>
  )
}