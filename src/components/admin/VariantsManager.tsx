'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Trash2, 
  Package, 
  Calculator,
  Star,
  Info
} from 'lucide-react'

export interface ProductVariant {
  id?: string
  name: string
  units: number
  price: number
  active: boolean
  isDefault: boolean
}

interface VariantsManagerProps {
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
  productStock?: number
  productPrice?: number
  disabled?: boolean
}

export function VariantsManager({ 
  variants, 
  onVariantsChange, 
  productStock = 0, 
  productPrice = 0,
  disabled = false 
}: VariantsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    name: '',
    units: 1,
    price: 0,
    active: true,
    isDefault: false
  })

  const handleAddVariant = () => {
    if (!newVariant.name || newVariant.units <= 0 || newVariant.price <= 0) {
      alert('Por favor completa todos los campos correctamente')
      return
    }

    const updatedVariants = [...variants, { ...newVariant }]
    
    // Si es la primera variante, marcarla como default
    if (updatedVariants.length === 1) {
      updatedVariants[0].isDefault = true
    }
    
    onVariantsChange(updatedVariants)
    setNewVariant({
      name: '',
      units: 1,
      price: 0,
      active: true,
      isDefault: false
    })
    setShowAddForm(false)
  }

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    
    // Si se marca como default, desmarcar las demás
    if (field === 'isDefault' && value === true) {
      updatedVariants.forEach((variant, i) => {
        if (i !== index) {
          variant.isDefault = false
        }
      })
    }
    
    onVariantsChange(updatedVariants)
  }

  const handleRemoveVariant = (index: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta variante?')) {
      return
    }
    
    const updatedVariants = variants.filter((_, i) => i !== index)
    
    // Si se eliminó la variante default, marcar la primera como default
    if (variants[index].isDefault && updatedVariants.length > 0) {
      updatedVariants[0].isDefault = true
    }
    
    onVariantsChange(updatedVariants)
  }

  const calculateAvailableStock = (units: number) => {
    return Math.floor(productStock / units)
  }

  const getVariantSavings = (variantPrice: number, units: number) => {
    const individualTotal = productPrice * units
    const savings = individualTotal - variantPrice
    const percentage = individualTotal > 0 ? (savings / individualTotal) * 100 : 0
    return { savings, percentage }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Variantes de Producto
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configura diferentes formatos de venta (packs, sets, etc.)
            </p>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Variante
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Info sobre venta individual */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Venta Individual</h4>
              <p className="text-sm text-blue-700 mt-1">
                Los clientes siempre pueden comprar unidades individuales por ${productPrice?.toLocaleString()} cada una. 
                Las variantes ofrecen formatos alternativos (packs, sets, etc.) con precios especiales.
              </p>
              {productStock > 0 && (
                <p className="text-sm text-blue-600 mt-2">
                  Stock disponible para venta individual: {productStock} unidades
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Formulario para agregar nueva variante */}
        {showAddForm && !disabled && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-variant-name">Nombre de la Variante *</Label>
                  <Input
                    id="new-variant-name"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Pack de 3, Set Familiar, etc."
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-variant-units">Unidades por Pack *</Label>
                    <Input
                      id="new-variant-units"
                      type="number"
                      min="1"
                      value={newVariant.units}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-variant-price">Precio del Pack (CLP) *</Label>
                    <Input
                      id="new-variant-price"
                      type="number"
                      min="0"
                      step="100"
                      value={newVariant.price}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Preview de la variante */}
                {newVariant.name && newVariant.units > 0 && newVariant.price > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <h5 className="font-medium text-sm">Vista Previa:</h5>
                    <div className="text-sm space-y-1">
                      <div>📦 {newVariant.name}: {newVariant.units} unidades por ${newVariant.price.toLocaleString()}</div>
                      {productStock > 0 && (
                        <div>📊 Stock disponible: {calculateAvailableStock(newVariant.units)} packs</div>
                      )}
                      {productPrice > 0 && (
                        <div className="flex items-center gap-2">
                          <Calculator className="h-3 w-3" />
                          {(() => {
                            const { savings, percentage } = getVariantSavings(newVariant.price, newVariant.units)
                            return savings > 0 ? (
                              <span className="text-green-600">
                                Ahorro: ${savings.toLocaleString()} ({percentage.toFixed(1)}%)
                              </span>
                            ) : savings < 0 ? (
                              <span className="text-red-600">
                                Sobreprecio: ${Math.abs(savings).toLocaleString()} ({Math.abs(percentage).toFixed(1)}%)
                              </span>
                            ) : (
                              <span className="text-gray-600">Mismo precio que unidades individuales</span>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleAddVariant}
                    size="sm"
                  >
                    Agregar Variante
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewVariant({
                        name: '',
                        units: 1,
                        price: 0,
                        active: true,
                        isDefault: false
                      })
                    }}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de variantes existentes */}
        {variants.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-4">Variantes Configuradas ({variants.length})</h4>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <Card key={index} className={`${variant.isDefault ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''}`}>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {/* Header con badges */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{variant.name}</h5>
                            {variant.isDefault && (
                              <Badge variant="default" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Por defecto
                              </Badge>
                            )}
                            <Badge variant={variant.active ? "success" : "secondary"} className="text-xs">
                              {variant.active ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                          {!disabled && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveVariant(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Campos de edición */}
                        {!disabled ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`variant-${index}-name`} className="text-xs">Nombre</Label>
                              <Input
                                id={`variant-${index}-name`}
                                value={variant.name}
                                onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)}
                                className="mt-1 h-8"
                                size="sm"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`variant-${index}-units`} className="text-xs">Unidades</Label>
                              <Input
                                id={`variant-${index}-units`}
                                type="number"
                                min="1"
                                value={variant.units}
                                onChange={(e) => handleUpdateVariant(index, 'units', parseInt(e.target.value) || 1)}
                                className="mt-1 h-8"
                                size="sm"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`variant-${index}-price`} className="text-xs">Precio (CLP)</Label>
                              <Input
                                id={`variant-${index}-price`}
                                type="number"
                                min="0"
                                step="100"
                                value={variant.price}
                                onChange={(e) => handleUpdateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                className="mt-1 h-8"
                                size="sm"
                              />
                            </div>
                          </div>
                        ) : (
                          /* Vista de solo lectura */
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Unidades:</span>
                              <div className="font-medium">{variant.units}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Precio:</span>
                              <div className="font-medium">${variant.price.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stock disponible:</span>
                              <div className="font-medium">{calculateAvailableStock(variant.units)} packs</div>
                            </div>
                          </div>
                        )}

                        {/* Información calculada */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Stock disponible:</span>
                              <span className="ml-2 font-medium">
                                {calculateAvailableStock(variant.units)} packs
                              </span>
                            </div>
                            {productPrice > 0 && (
                              <div className="flex items-center gap-2">
                                <Calculator className="h-3 w-3 text-muted-foreground" />
                                {(() => {
                                  const { savings, percentage } = getVariantSavings(variant.price, variant.units)
                                  return savings > 0 ? (
                                    <span className="text-green-600 text-sm">
                                      Ahorro: ${savings.toLocaleString()} ({percentage.toFixed(1)}%)
                                    </span>
                                  ) : savings < 0 ? (
                                    <span className="text-red-600 text-sm">
                                      Sobreprecio: ${Math.abs(savings).toLocaleString()} ({Math.abs(percentage).toFixed(1)}%)
                                    </span>
                                  ) : (
                                    <span className="text-gray-600 text-sm">Sin diferencia de precio</span>
                                  )
                                })()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Controles */}
                        {!disabled && (
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={variant.active}
                                  onCheckedChange={(checked) => handleUpdateVariant(index, 'active', checked)}
                                  size="sm"
                                />
                                <Label className="text-xs">Activa</Label>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={variant.isDefault}
                                  onCheckedChange={(checked) => handleUpdateVariant(index, 'isDefault', checked)}
                                  size="sm"
                                />
                                <Label className="text-xs">Por defecto</Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {variants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h4 className="font-medium mb-2">No hay variantes configuradas</h4>
            <p className="text-sm">
              {disabled 
                ? 'Este producto solo se vende en unidades individuales.'
                : 'Agrega variantes para ofrecer diferentes formatos de venta como packs o sets.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}