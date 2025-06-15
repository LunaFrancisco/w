import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'

// Initialize MercadoPago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('MercadoPago Webhook received:', body)

    // Validate webhook signature (optional but recommended)
    // You can implement signature validation here for additional security

    const { type, data } = body

    if (type === 'payment') {
      const paymentId = data.id

      if (!paymentId) {
        console.log('No payment ID provided')
        return NextResponse.json({ status: 'error', message: 'No payment ID' }, { status: 400 })
      }

      // Get payment details from MercadoPago
      const paymentInfo = await payment.get({ id: paymentId })

      if (!paymentInfo) {
        console.log('Payment not found:', paymentId)
        return NextResponse.json({ status: 'error', message: 'Payment not found' }, { status: 404 })
      }

      const orderId = paymentInfo.external_reference
      const paymentStatus = paymentInfo.status
      const paymentStatusDetail = paymentInfo.status_detail

      console.log('Processing payment:', {
        paymentId,
        orderId,
        status: paymentStatus,
        statusDetail: paymentStatusDetail
      })

      if (!orderId) {
        console.log('No order ID in external_reference')
        return NextResponse.json({ status: 'error', message: 'No order reference' }, { status: 400 })
      }

      // Find the order in our database
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      })

      if (!order) {
        console.log('Order not found:', orderId)
        return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 })
      }

      // Update order based on payment status
      let newOrderStatus = order.status
      let newPaymentStatus = paymentStatus || 'pending'

      switch (paymentStatus) {
        case 'approved':
          newOrderStatus = 'PAID'
          newPaymentStatus = 'approved'
          
          // Reduce stock for approved payments
          if (order.status === 'PENDING') {
            for (const item of order.items) {
              await prisma.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    decrement: item.quantity
                  }
                }
              })
            }
          }
          break

        case 'pending':
          newOrderStatus = 'PENDING'
          newPaymentStatus = 'pending'
          break

        case 'in_process':
          newOrderStatus = 'PENDING'
          newPaymentStatus = 'in_process'
          break

        case 'rejected':
        case 'cancelled':
          newOrderStatus = 'CANCELLED'
          newPaymentStatus = paymentStatus
          break

        case 'refunded':
        case 'charged_back':
          newOrderStatus = 'CANCELLED'
          newPaymentStatus = paymentStatus
          
          // Restore stock for refunded/charged back payments
          if (order.status === 'PAID' || order.status === 'PREPARING' || order.status === 'SHIPPED') {
            for (const item of order.items) {
              await prisma.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    increment: item.quantity
                  }
                }
              })
            }
          }
          break

        default:
          console.log('Unknown payment status:', paymentStatus)
      }

      // Update the order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: newOrderStatus,
          paymentStatus: newPaymentStatus,
          mercadopagoId: paymentId.toString(),
          updatedAt: new Date()
        }
      })

      console.log('Order updated:', {
        orderId,
        newStatus: newOrderStatus,
        newPaymentStatus
      })

      // TODO: Send email notification to user
      // You can implement email sending here

      return NextResponse.json({ 
        status: 'success', 
        message: 'Webhook processed successfully' 
      })

    } else {
      console.log('Webhook type not handled:', type)
      return NextResponse.json({ 
        status: 'ignored', 
        message: 'Webhook type not handled' 
      })
    }

  } catch (error) {
    console.error('Error processing MercadoPago webhook:', error)
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}