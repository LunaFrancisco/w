import crypto from 'crypto'

// Environment variables validation
if (!process.env.FLOW_API_KEY) {
  throw new Error('FLOW_API_KEY environment variable is required')
}

if (!process.env.FLOW_SECRET_KEY) {
  throw new Error('FLOW_SECRET_KEY environment variable is required')
}

// Flow API Configuration
const FLOW_CONFIG = {
  apiKey: process.env.FLOW_API_KEY,
  secretKey: process.env.FLOW_SECRET_KEY,
  sandboxMode: process.env.FLOW_SANDBOX_MODE === 'true',
  baseUrl: process.env.FLOW_SANDBOX_MODE === 'true' 
    ? 'https://sandbox.flow.cl/api' 
    : 'https://www.flow.cl/api',
}

// TypeScript Interfaces
export interface FlowPaymentRequest {
  apiKey: string
  commerceOrder: string
  subject: string
  amount: number
  email: string
  urlConfirmation: string
  urlReturn: string
  paymentMethod?: string
  currency?: string
  timeout?: number
  merchantId?: string
  s?: string // signature
}

export interface FlowPaymentResponse {
  url: string
  token: string
  flowOrder: number
}

export interface FlowPaymentStatus {
  flowOrder: number
  commerceOrder: string
  requestDate: string
  status: number
  subject: string
  currency: string
  amount: number
  payer: string
  optional?: string
  pending_info?: {
    media: string
    date: string
  }
  paymentData?: {
    date: string
    media: string
    conversionDate: string
    conversionRate: number
    amount: number
    currency: string
    fee: number
    balance: number
    transferDate: string
  }
}

export interface FlowStatusRequest {
  apiKey: string
  token: string
  s?: string // signature
}

export interface FlowRefundRequest {
  apiKey: string
  refundCommerceOrder: string
  receiverEmail: string
  amount: number
  urlCallBack: string
  s?: string // signature
}

// Parameter sorting and concatenation for signature generation
export function concatenateParameters(params: Record<string, any>): string {
  // Remove signature parameter if present
  const { s, ...paramsWithoutSignature } = params
  
  // Sort parameters alphabetically by key
  const sortedKeys = Object.keys(paramsWithoutSignature).sort()
  
  // Concatenate parameter names and values
  let concatenated = ''
  for (const key of sortedKeys) {
    const value = paramsWithoutSignature[key]
    if (value !== undefined && value !== null) {
      concatenated += key + value
    }
  }
  
  return concatenated
}

// HMAC-SHA256 signature generation
export function generateFlowSignature(params: Record<string, any>): string {
  try {
    const concatenatedParams = concatenateParameters(params)
    console.log('Flow signature - concatenated params:', concatenatedParams)
    
    const signature = crypto
      .createHmac('sha256', FLOW_CONFIG.secretKey)
      .update(concatenatedParams)
      .digest('hex')
    
    console.log('Flow signature generated:', signature)
    return signature
  } catch (error) {
    console.error('Error generating Flow signature:', error)
    throw new Error('Failed to generate Flow signature')
  }
}

// Validate Flow webhook signature
export function validateFlowWebhookSignature(token: string, expectedSignature?: string): boolean {
  try {
    if (!expectedSignature) {
      console.warn('No signature provided for Flow webhook validation')
      return false
    }
    
    const calculatedSignature = crypto
      .createHmac('sha256', FLOW_CONFIG.secretKey)
      .update(token)
      .digest('hex')
    
    const isValid = calculatedSignature === expectedSignature
    
    if (!isValid) {
      console.error('Flow webhook signature validation failed')
      console.error('Expected:', expectedSignature)
      console.error('Calculated:', calculatedSignature)
      console.error('Token:', token)
    }
    
    return isValid
  } catch (error) {
    console.error('Error validating Flow webhook signature:', error)
    return false
  }
}

// Create Flow payment order
export async function createFlowPayment(paymentData: Omit<FlowPaymentRequest, 'apiKey' | 's'>): Promise<FlowPaymentResponse> {
  try {
    const params: FlowPaymentRequest = {
      apiKey: FLOW_CONFIG.apiKey,
      ...paymentData,
    }
    
    // Generate signature
    params.s = generateFlowSignature(params)
    
    console.log('Creating Flow payment with params:', { ...params, s: '[REDACTED]' })
    console.log('Flow config:', {
      baseUrl: FLOW_CONFIG.baseUrl,
      sandboxMode: FLOW_CONFIG.sandboxMode,
      hasApiKey: !!FLOW_CONFIG.apiKey,
      apiKeyLength: FLOW_CONFIG.apiKey.length
    })
    
    const response = await fetch(`${FLOW_CONFIG.baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params as any).toString(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Flow API error:', response.status, errorText)
      throw new Error(`Flow API error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('Flow payment created successfully:', result)
    
    return result
  } catch (error) {
    console.error('Error creating Flow payment:', error)
    throw new Error('Failed to create Flow payment')
  }
}

// Get Flow payment status
export async function getFlowPaymentStatus(token: string): Promise<FlowPaymentStatus> {
  try {
    const params: FlowStatusRequest = {
      apiKey: FLOW_CONFIG.apiKey,
      token: token,
    }
    
    // Generate signature
    params.s = generateFlowSignature(params)
    
    console.log('Getting Flow payment status for token:', token)
    
    const response = await fetch(`${FLOW_CONFIG.baseUrl}/payment/getStatus?${new URLSearchParams(params as any).toString()}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Flow API error:', response.status, errorText)
      throw new Error(`Flow API error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('Flow payment status retrieved:', result)
    
    return result
  } catch (error) {
    console.error('Error getting Flow payment status:', error)
    throw new Error('Failed to get Flow payment status')
  }
}

// Convert Flow status to our PaymentStatus enum
export function convertFlowStatusToPaymentStatus(flowStatus: number): 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' {
  switch (flowStatus) {
    case 1: // Pendiente de Pago
      return 'PENDING'
    case 2: // Pagada
      return 'APPROVED'
    case 3: // Rechazada
      return 'REJECTED'
    case 4: // Anulada
      return 'CANCELLED'
    default:
      console.warn('Unknown Flow status:', flowStatus)
      return 'PENDING'
  }
}

// Convert Flow payment status to order status
export function getFlowOrderStatus(paymentStatus: string): 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' {
  switch (paymentStatus) {
    case 'APPROVED':
      return 'PAID'
    case 'REJECTED':
    case 'CANCELLED':
      return 'CANCELLED'
    case 'PENDING':
    default:
      return 'PENDING'
  }
}

// Create Flow refund
export async function createFlowRefund(refundData: Omit<FlowRefundRequest, 'apiKey' | 's'>): Promise<any> {
  try {
    const params: FlowRefundRequest = {
      apiKey: FLOW_CONFIG.apiKey,
      ...refundData,
    }
    
    // Generate signature
    params.s = generateFlowSignature(params)
    
    console.log('Creating Flow refund with params:', { ...params, s: '[REDACTED]' })
    
    const response = await fetch(`${FLOW_CONFIG.baseUrl}/refund/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params as any).toString(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Flow refund API error:', response.status, errorText)
      throw new Error(`Flow refund API error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('Flow refund created successfully:', result)
    
    return result
  } catch (error) {
    console.error('Error creating Flow refund:', error)
    throw new Error('Failed to create Flow refund')
  }
}

// Flow test data for sandbox
export const FLOW_TEST_DATA = {
  creditCard: {
    number: '4051885600446623',
    cvv: '123',
    expiry: '12/25', // Any future date
  },
  bankTransfer: {
    rut: '11111111-1',
    password: '123',
  },
}

// Export configuration for debugging
export const getFlowConfig = () => ({
  sandboxMode: FLOW_CONFIG.sandboxMode,
  baseUrl: FLOW_CONFIG.baseUrl,
  hasApiKey: !!FLOW_CONFIG.apiKey,
  hasSecretKey: !!FLOW_CONFIG.secretKey,
})