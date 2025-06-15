import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configuración de MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
})

export const mercadoPagoClient = client
export const preference = new Preference(client)

// Tipos para MercadoPago
export interface PaymentItem {
  id: string
  title: string
  description?: string
  picture_url?: string
  category_id?: string
  quantity: number
  currency_id: string
  unit_price: number
}

export interface PaymentPayer {
  name?: string
  surname?: string
  email?: string
  phone?: {
    area_code?: string
    number?: string
  }
  identification?: {
    type?: string
    number?: string
  }
  address?: {
    street_name?: string
    street_number?: number
    zip_code?: string
  }
}

export interface PaymentShipment {
  cost: number
  mode: string
  receiver_address: {
    zip_code?: string
    street_name?: string
    street_number?: number
    floor?: string
    apartment?: string
    city_name?: string
    state_name?: string
    country_name?: string
  }
}

export interface CreatePreferenceData {
  items: PaymentItem[]
  payer?: PaymentPayer
  shipments?: PaymentShipment
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: 'approved' | 'all'
  notification_url?: string
  external_reference?: string
  statement_descriptor?: string
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>
    excluded_payment_types?: Array<{ id: string }>
    installments?: number
  }
}

// Función para crear una preferencia de pago
export async function createPaymentPreference(data: CreatePreferenceData) {
  try {
    const response = await preference.create({
      body: {
        items: data.items,
        payer: data.payer,
        shipments: data.shipments,
        back_urls: data.back_urls || {
          success: `${process.env.NEXTAUTH_URL}/checkout/success`,
          failure: `${process.env.NEXTAUTH_URL}/checkout/failure`,
          pending: `${process.env.NEXTAUTH_URL}/checkout/pending`
        },
        auto_return: data.auto_return || 'approved',
        notification_url: data.notification_url || `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
        external_reference: data.external_reference,
        statement_descriptor: data.statement_descriptor || 'Club W',
        payment_methods: {
          excluded_payment_methods: data.payment_methods?.excluded_payment_methods || [],
          excluded_payment_types: data.payment_methods?.excluded_payment_types || [],
          installments: data.payment_methods?.installments || 12
        }
      }
    })

    return response
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error)
    throw error
  }
}

// Función para formatear items del carrito para MercadoPago
export function formatCartItemsForMP(cartItems: any[]): PaymentItem[] {
  return cartItems.map(item => ({
    id: item.productId,
    title: item.name,
    description: `Producto exclusivo de Club W`,
    picture_url: item.image,
    category_id: 'others',
    quantity: item.quantity,
    currency_id: 'CLP',
    unit_price: item.price
  }))
}

// Función para formatear información del usuario
export function formatPayerInfo(user: any, address?: any): PaymentPayer {
  const names = user.name?.split(' ') || ['', '']
  
  return {
    name: names[0] || '',
    surname: names.slice(1).join(' ') || '',
    email: user.email,
    phone: address?.phone ? {
      area_code: '56',
      number: address.phone.replace(/[^\d]/g, '')
    } : undefined,
    address: address ? {
      street_name: address.street,
      zip_code: address.zipCode
    } : undefined
  }
}

// Función para formatear información de envío
export function formatShippingInfo(address: any, shippingCost: number): PaymentShipment {
  return {
    cost: shippingCost,
    mode: 'me2',
    receiver_address: {
      zip_code: address.zipCode,
      street_name: address.street,
      city_name: address.commune,
      state_name: address.region,
      country_name: 'Chile'
    }
  }
}