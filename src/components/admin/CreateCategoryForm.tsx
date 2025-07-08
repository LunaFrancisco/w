'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { STORAGE_PREFIXES } from '@/lib/storage'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  showInHome: boolean
  active: boolean
}

interface CreateCategoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (category?: any) => void
  category?: Category | null // Para modo edición
}

export function CreateCategoryForm({ isOpen, onClose, onSuccess, category }: CreateCategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image: category?.image || '',
    showInHome: category?.showInHome || false,
    active: category?.active ?? true
  })

  // Reset form when category changes or dialog opens/closes
  const [isDeleting, setIsDeleting] = useState(false)
  
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name || '',
        description: category?.description || '',
        image: category?.image || '',
        showInHome: category?.showInHome || false,
        active: category?.active ?? true
      })
      setImageFile(null)
      setImagePreview(null)
    }
  }, [isOpen, category])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo debe ser menor a 5MB')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({
      ...prev,
      image: ''
    }))
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', imageFile)
      uploadFormData.append('prefix', STORAGE_PREFIXES.CATEGORY_IMAGES)

      const response = await fetch('/api/upload/direct', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('El nombre es requerido')
      return
    }

    setIsLoading(true)
    
    try {
      // Upload image if present
      let imageUrl = formData.image
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl) {
          setIsLoading(false)
          return
        }
      }

      const categoryData = {
        ...formData,
        image: imageUrl
      }

      const url = category 
        ? `/api/categories/${category.id}` 
        : '/api/categories'
      const method = category ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Error al ${category ? 'actualizar' : 'crear'} la categoría`)
      }

      const resultCategory = await response.json()
      onSuccess(resultCategory)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        image: '',
        showInHome: false
      })
      setImageFile(null)
      setImagePreview(null)
      
      onClose()
      
    } catch (error) {
      console.error('Error creating category:', error)
      alert(error instanceof Error ? error.message : 'Error al crear la categoría')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!category) return
    
    if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar la categoría')
      }

      onSuccess()
      onClose()
      
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar la categoría')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isLoading && !isUploading && !isDeleting) {
      setFormData({
        name: '',
        description: '',
        image: '',
        showInHome: false
      })
      setImageFile(null)
      setImagePreview(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoría' : 'Crear Nueva Categoría'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category-name">Nombre de la Categoría *</Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Flores, Extractos, Edibles"
              required
              disabled={isLoading || isUploading}
            />
          </div>

          <div>
            <Label htmlFor="category-description">Descripción</Label>
            <Textarea
              id="category-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción de la categoría (opcional)"
              rows={3}
              disabled={isLoading || isUploading}
            />
          </div>

          <div>
            <Label>Imagen de la Categoría</Label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Vista previa"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    disabled={isLoading || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click para subir</span> una imagen
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isLoading || isUploading}
                  />
                </label>
              )}
              
              <div className="text-center text-sm text-gray-500">o</div>
              
              <div>
                <Label htmlFor="category-image-url">URL de Imagen</Label>
                <Input
                  id="category-image-url"
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={isLoading || isUploading || !!imageFile}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="show-in-home">Mostrar en la página principal</Label>
              <p className="text-sm text-gray-600">La categoría aparecerá en la sección de categorías del home</p>
            </div>
            <Switch
              id="show-in-home"
              checked={formData.showInHome}
              onCheckedChange={(checked) => handleInputChange('showInHome', checked)}
              disabled={isLoading || isUploading}
            />
          </div>

          <DialogFooter className={category ? "flex justify-between" : ""}>
            {category && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || isUploading || isDeleting}
                className="mr-auto"
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Eliminando...
                  </div>
                ) : (
                  'Eliminar'
                )}
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading || isUploading || isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading || isDeleting}
              >
                {isLoading || isUploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {isUploading ? 'Subiendo imagen...' : (category ? 'Guardando...' : 'Creando...')}
                  </div>
                ) : (
                  category ? 'Guardar Cambios' : 'Crear Categoría'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}