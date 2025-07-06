// Calcular stock disponible para venta individual o variante
export function calculateAvailableStock(productStock: number, units: number = 1): number {
  return Math.floor(productStock / units);
}

// Calcular unidades requeridas para una compra
export function calculateRequiredUnits(quantity: number, units: number = 1): number {
  return quantity * units;
}

// Validar si hay suficiente stock para una compra
export function validateStockAvailability(
  productStock: number,
  quantity: number,
  units: number = 1
): boolean {
  const requiredUnits = calculateRequiredUnits(quantity, units);
  return productStock >= requiredUnits;
}

// Actualizar stock después de una compra
export function updateStockAfterPurchase(
  currentStock: number,
  quantity: number,
  units: number = 1
): number {
  const requiredUnits = calculateRequiredUnits(quantity, units);
  return currentStock - requiredUnits;
}

// Obtener información de compra (precio y units)
export function getPurchaseInfo(
  product: any,
  variantId: string | null
): { price: number; units: number; name: string } {
  if (!variantId) {
    return {
      price: Number(product.price),
      units: 1,
      name: 'Unidad Individual'
    };
  }
  
  const variant = product.variants?.find((v: any) => v.id === variantId);
  if (!variant) {
    throw new Error('Variante no encontrada');
  }
  
  return {
    price: Number(variant.price),
    units: variant.units,
    name: variant.name
  };
}