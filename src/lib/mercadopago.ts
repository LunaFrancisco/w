import { MercadoPagoConfig, Preference } from 'mercadopago'
import crypto from 'crypto'
import { NextRequest } from 'next/server'

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN environment variable is required')
}

if (!process.env.MP_WEBHOOK_SECRET) {
  throw new Error('MP_WEBHOOK_SECRET environment variable is required')
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  }
})

export const preference = new Preference(client)

export interface CreatePreferenceData {
  items: {
    id: string
    title: string
    description: string
    quantity: number
    unit_price: number
    currency_id: string
  }[]
  external_reference: string
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: 'approved' | 'all'
  payer?: {
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
      street_number?: string
      zip_code?: string
    }
  }
  shipments?: {
    cost: number
    mode: string
    receiver_address?: {
      zip_code?: string
      street_name?: string
      street_number?: string
      floor?: string
      apartment?: string
      city_name?: string
      state_name?: string
      country_name?: string
    }
  }
  notification_url?: string
}

export async function createPaymentPreference(data: CreatePreferenceData) {
  try {
    const preferenceData = {
      items: data.items,
      external_reference: data.external_reference,
      back_urls: data.back_urls,
      auto_return: data.auto_return,
      notification_url: data.notification_url,
      ...(data.payer && { payer: data.payer }),
      ...(data.shipments && { shipments: data.shipments }),
    }

    const result = await preference.create({ body: preferenceData })
    return result
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error)
    throw new Error('Failed to create payment preference')
  }
}

export function getPaymentStatus(mpStatus: string): 'PENDING' | 'APPROVED' | 'AUTHORIZED' | 'IN_PROCESS' | 'IN_MEDIATION' | 'REJECTED' | 'CANCELLED' | 'REFUNDED' | 'CHARGED_BACK' {
  switch (mpStatus.toLowerCase()) {
    case 'approved':
      return 'APPROVED'
    case 'authorized':
      return 'AUTHORIZED'
    case 'in_process':
      return 'IN_PROCESS'
    case 'in_mediation':
      return 'IN_MEDIATION'
    case 'rejected':
      return 'REJECTED'
    case 'cancelled':
      return 'CANCELLED'
    case 'refunded':
      return 'REFUNDED'
    case 'charged_back':
      return 'CHARGED_BACK'
    case 'pending':
    default:
      return 'PENDING'
  }
}

export function getOrderStatus(paymentStatus: string): 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' {
  switch (paymentStatus) {
    case 'APPROVED':
    case 'AUTHORIZED':
      return 'PAID'
    case 'REJECTED':
    case 'CANCELLED':
    case 'CHARGED_BACK':
      return 'CANCELLED'
    case 'PENDING':
    case 'IN_PROCESS':
    case 'IN_MEDIATION':
    default:
      return 'PENDING'
  }
}

export function validateWebhookSignature(request: NextRequest): boolean {
  try {
    // Get headers
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')
    
    if (!xSignature) {
      console.error('Missing x-signature header')
      return false
    }

    // Extract ts and v1 from x-signature
    const parts = xSignature.split(',')
    let ts: string | null = null
    let hash: string | null = null

    for (const part of parts) {
      const [key, value] = part.split('=', 2)
      if (key?.trim() === 'ts') {
        ts = value?.trim()
      } else if (key?.trim() === 'v1') {
        hash = value?.trim()
      }
    }

    if (!ts || !hash) {
      console.error('Missing ts or v1 in x-signature header')
      return false
    }

    // Get data.id from query params
    const url = new URL(request.url)
    const dataId = url.searchParams.get('data.id')

    if (!dataId) {
      console.error('Missing data.id in query params')
      return false
    }

    // Build the manifest template: id:[data.id];request-id:[x-request-id];ts:[ts];
    let manifest = `id:${dataId.toLowerCase()};`
    
    if (xRequestId) {
      manifest += `request-id:${xRequestId};`
    }
    
    manifest += `ts:${ts};`

    // Generate HMAC SHA256
    const secret = process.env.MP_WEBHOOK_SECRET!
    const calculatedHash = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex')

    // Compare hashes
    const isValid = calculatedHash === hash

    if (!isValid) {
      console.error('Webhook signature validation failed')
      console.error('Expected:', calculatedHash)
      console.error('Received:', hash)
      console.error('Manifest:', manifest)
    }

    return isValid
  } catch (error) {
    console.error('Error validating webhook signature:', error)
    return false
  }
}