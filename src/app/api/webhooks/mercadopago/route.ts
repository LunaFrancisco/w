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

    const { type, data, action } = body

    if (type === 'payment') {
      const paymentId = data.id

      if (!paymentId) {
        console.log('No payment ID provided')
        return NextResponse.json({ status: 'error', message: 'No payment ID' }, { status: 400 })
      }

      let paymentInfo
      try {
        // Get payment details from MercadoPago
        paymentInfo = await payment.get({ id: paymentId })
      } catch (error: any) {
        console.error('Error fetching payment from MercadoPago:', error)
        
        // If payment not found but this is a test webhook, return success to avoid retries
        if (error?.cause?.[0]?.code === 2000 || error?.status === 404) {
          console.log('Payment not found (possibly test data):', paymentId)
          return NextResponse.json({ 
            status: 'ignored', 
            message: 'Payment not found - ignoring webhook' 
          })
        }
        
        throw error
      }

      if (!paymentInfo) {
        console.log('Payment not found:', paymentId)
        return NextResponse.json({ 
          status: 'ignored', 
          message: 'Payment not found - ignoring webhook' 
        })
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
        console.log('No order ID in external_reference for payment:', paymentId)
        return NextResponse.json({ 
          status: 'ignored', 
          message: 'No order reference - ignoring webhook' 
        })
      }

      // Find the order in our database
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      })

      if (!order) {
        console.log('Order not found in database:', orderId)
        return NextResponse.json({ 
          status: 'ignored', 
          message: 'Order not found - ignoring webhook' 
        })
      }

      // Map MercadoPago status to our PaymentStatus enum
      let dbPaymentStatus: 'PENDING' | 'APPROVED' | 'IN_PROCESS' | 'REJECTED' | 'CANCELLED' | 'REFUNDED' | 'CHARGED_BACK' = 'PENDING'
      let newOrderStatus = order.status
      let newPaymentStatus = paymentStatus || 'pending'

      switch (paymentStatus) {
        case 'approved':
          newOrderStatus = 'PAID'
          newPaymentStatus = 'approved'
          dbPaymentStatus = 'APPROVED'
          
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
          dbPaymentStatus = 'PENDING'
          break

        case 'in_process':
          newOrderStatus = 'PENDING'
          newPaymentStatus = 'in_process'
          dbPaymentStatus = 'IN_PROCESS'
          break

        case 'rejected':
          newOrderStatus = 'CANCELLED'
          newPaymentStatus = paymentStatus
          dbPaymentStatus = 'REJECTED'
          break

        case 'cancelled':
          newOrderStatus = 'CANCELLED'
          newPaymentStatus = paymentStatus
          dbPaymentStatus = 'CANCELLED'
          break

        case 'refunded':
          newOrderStatus = 'CANCELLED'
          newPaymentStatus = paymentStatus
          dbPaymentStatus = 'REFUNDED'
          break

        case 'charged_back':
          newOrderStatus = 'CANCELLED'
          newPaymentStatus = paymentStatus
          dbPaymentStatus = 'CHARGED_BACK'
          
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

      // Update the order and create/update payment record
      try {
        await prisma.$transaction(async (tx) => {
          // Update the order
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: newOrderStatus,
              paymentStatus: newPaymentStatus,
              mercadopagoId: paymentId.toString(),
              updatedAt: new Date()
            }
          })

          // Create or update payment record
          await tx.payment.upsert({
            where: { mercadopagoId: paymentId.toString() },
            update: {
              status: dbPaymentStatus,
              statusDetail: paymentStatusDetail,
              paymentMethod: paymentInfo.payment_method_id,
              paymentType: paymentInfo.payment_type_id,
              transactionAmount: paymentInfo.transaction_amount,
              installments: paymentInfo.installments,
              issuerId: paymentInfo.issuer_id,
              payerEmail: paymentInfo.payer?.email,
              webhookData: JSON.parse(JSON.stringify(body)),
              mercadopagoResponse: JSON.parse(JSON.stringify(paymentInfo)),
              updatedAt: new Date()
            },
            create: {
              orderId: orderId,
              mercadopagoId: paymentId.toString(),
              status: dbPaymentStatus,
              statusDetail: paymentStatusDetail,
              amount: paymentInfo.transaction_amount || order.total,
              currency: paymentInfo.currency_id || 'CLP',
              paymentMethod: paymentInfo.payment_method_id,
              paymentType: paymentInfo.payment_type_id,
              transactionAmount: paymentInfo.transaction_amount,
              installments: paymentInfo.installments,
              issuerId: paymentInfo.issuer_id,
              payerEmail: paymentInfo.payer?.email,
              webhookData: JSON.parse(JSON.stringify(body)),
              mercadopagoResponse: JSON.parse(JSON.stringify(paymentInfo))
            }
          })
        })

        console.log('Order and payment updated successfully:', {
          orderId,
          paymentId,
          oldStatus: order.status,
          newStatus: newOrderStatus,
          oldPaymentStatus: order.paymentStatus,
          newPaymentStatus,
          dbPaymentStatus,
          action: body.action
        })
      } catch (updateError) {
        console.error('Error updating order and payment:', updateError)
        throw new Error(`Failed to update order ${orderId}: ${updateError}`)
      }

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