'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload, X, Plus } from 'lucide-react'
import Link from 'next/link'
import { VariantsManager, ProductVariant } from './VariantsManager'
import { CreateCategoryForm } from './CreateCategoryForm'

interface Category {
  id: string
  name: string
  slug: string
}

interface CreateProductFormProps {
  categories: Category[]
}

export function CreateProductForm({ categories }: CreateProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>(categories)
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    active: true,
    featured: false,
    allowIndividualSale: true,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUrlChange = (index: number, url: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = url
    setImageUrls(newUrls)
    setImages(newUrls.filter(url => url.trim() !== ''))
  }

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, ''])
  }

  const removeImageUrlField = (index: number) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index)
      setImageUrls(newUrls)
      setImages(newUrls.filter(url => url.trim() !== ''))
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.price || !formData.stock || !formData.categoryId) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    setIsLoading(true)
    
    try {
      const slug = generateSlug(formData.name)
      
      const productData = {
        ...formData,
        slug,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: images.filter(url => url.trim() !== ''),
        variants,
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear el producto')
      }

      const result = await response.json()
      
      alert('Producto creado exitosamente')
      router.push('/admin/productos')
      
    } catch (error) {
      console.error('Error creating product:', error)
      alert(error instanceof Error ? error.message : 'Error al crear el producto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryCreated = (newCategory: Category) => {
    setAvailableCategories(prev => [...prev, newCategory])
    setFormData(prev => ({
      ...prev,
      categoryId: newCategory.id
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/productos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe el producto en detalle"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio (CLP) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="15000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    placeholder="50"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCategoryFormOpen(true)}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nueva
                  </Button>
                </div>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Imágenes del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Agrega URLs de imágenes para el producto. La primera imagen será la principal.
              </p>
              
              {imageUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1"
                  />
                  {imageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageUrlField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addImageUrlField}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Agregar otra imagen
              </Button>
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg'
                        }}
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variants Manager */}
          <VariantsManager
            variants={variants}
            onVariantsChange={setVariants}
            productStock={parseInt(formData.stock) || 0}
            productPrice={parseFloat(formData.price) || 0}
          />
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active">Producto Activo</Label>
                  <p className="text-sm text-gray-600">Mostrar en el catálogo</p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Producto Destacado</Label>
                  <p className="text-sm text-gray-600">Mostrar como destacado</p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowIndividualSale">Venta Individual</Label>
                  <p className="text-sm text-gray-600">Permitir venta por unidad individual</p>
                </div>
                <Switch
                  id="allowIndividualSale"
                  checked={formData.allowIndividualSale}
                  onCheckedChange={(checked) => handleInputChange('allowIndividualSale', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista Previa del Slug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                URL del producto:
              </div>
              <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                /productos/{formData.name ? generateSlug(formData.name) : 'nombre-del-producto'}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Creando producto...
                </div>
              ) : (
                'Crear Producto'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/admin/productos')}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
      
      <CreateCategoryForm
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        onSuccess={handleCategoryCreated}
      />
    </form>
  )
}