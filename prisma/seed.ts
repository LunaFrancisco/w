import { PrismaClient, UserRole, AccessRequestStatus, OrderStatus, PaymentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning up existing data...')
    await prisma.orderItem.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.shippingZone.deleteMany()
    await prisma.address.deleteMany()
    await prisma.accessRequest.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
  }

  // Create test users with different roles
  console.log('👤 Creating test users...')
  
  // Admin user (will be created automatically when you login with panshowlate@gmail.com)
  // But let's create some test users for demo purposes
  
  const clientUser1 = await prisma.user.create({
    data: {
      email: 'pancholate.luna@email.com',
      name: 'María González',
      role: UserRole.CLIENT,
      emailVerified: new Date(),
    },
  })

  const clientUser2 = await prisma.user.create({
    data: {
      email: 'carlos.rodriguez@email.com',
      name: 'Carlos Rodríguez',
      role: UserRole.CLIENT,
      emailVerified: new Date(),
    },
  })

  const clientUser3 = await prisma.user.create({
    data: {
      email: 'ana.martinez@email.com',
      name: 'Ana Martínez',
      role: UserRole.CLIENT,
      emailVerified: new Date(),
    },
  })

  const pendingUser = await prisma.user.create({
    data: {
      email: 'francisco.luna@mail.udp.cl',
      name: 'Francisco Luna',
      role: UserRole.PENDING,
      emailVerified: new Date(),
    },
  })

  // Create access requests
  console.log('📝 Creating access requests...')
  await prisma.accessRequest.create({
    data: {
      userId: pendingUser.id,
      status: AccessRequestStatus.PENDING,
      documents: [
        'https://example.com/cv-pedro.pdf',
        'https://example.com/recommendation-pedro.pdf'
      ],
    },
  })

  // Create approved access request
  await prisma.accessRequest.create({
    data: {
      userId: clientUser1.id,
      status: AccessRequestStatus.APPROVED,
      documents: ['https://example.com/cv-maria.pdf'],
      processedAt: new Date(),
      adminNotes: 'Usuario aprobado. Perfil profesional excelente.',
    },
  })

  // Create shipping zones for Santiago communes
  console.log('🚚 Creating shipping zones...')
  const shippingZones = [
    { commune: 'Las Condes', cost: 3500, deliveryDays: 1 },
    { commune: 'Providencia', cost: 3500, deliveryDays: 1 },
    { commune: 'Vitacura', cost: 3500, deliveryDays: 1 },
    { commune: 'Ñuñoa', cost: 4000, deliveryDays: 2 },
    { commune: 'Santiago Centro', cost: 4500, deliveryDays: 2 },
    { commune: 'La Reina', cost: 4000, deliveryDays: 2 },
    { commune: 'Maipú', cost: 5000, deliveryDays: 3 },
    { commune: 'Puente Alto', cost: 5500, deliveryDays: 3 },
    { commune: 'San Bernardo', cost: 5500, deliveryDays: 3 },
    { commune: 'Quilicura', cost: 5000, deliveryDays: 3 },
  ]

  for (const zone of shippingZones) {
    await prisma.shippingZone.create({
      data: zone,
    })
  }


  // Create product categories
  console.log('📦 Creating product categories...')
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electrónicos',
      slug: 'electronicos',
      description: 'Dispositivos electrónicos de alta gama y tecnología avanzada',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    },
  })

  const fashionCategory = await prisma.category.create({
    data: {
      name: 'Moda y Accesorios',
      slug: 'moda-accesorios',
      description: 'Ropa y accesorios de marcas premium y diseñadores exclusivos',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    },
  })

  const homeCategory = await prisma.category.create({
    data: {
      name: 'Hogar y Decoración',
      slug: 'hogar-decoracion',
      description: 'Artículos premium para el hogar y decoración de interiores',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    },
  })

  const sportsCategory = await prisma.category.create({
    data: {
      name: 'Deportes y Fitness',
      slug: 'deportes-fitness',
      description: 'Equipamiento deportivo de alta calidad y marcas reconocidas',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    },
  })

  // Create products
  console.log('🛍️ Creating products...')
  const products = [
    // Electronics
    {
      name: 'iPhone 15 Pro Max 256GB',
      slug: 'iphone-15-pro-max-256gb',
      description: 'El iPhone más avanzado con chip A17 Pro, sistema de cámaras profesional y pantalla Super Retina XDR de 6.7 pulgadas. Diseño en titanio premium.',
      price: 1299000,
      stock: 25,
      categoryId: electronicsCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600'
      ],
    },
    {
      name: 'MacBook Air M3 15"',
      slug: 'macbook-air-m3-15',
      description: 'MacBook Air de 15 pulgadas con chip M3, pantalla Liquid Retina de 15.3 pulgadas y hasta 18 horas de duración de batería.',
      price: 1650000,
      stock: 15,
      categoryId: electronicsCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'
      ],
    },
    {
      name: 'AirPods Pro (3ra generación)',
      slug: 'airpods-pro-3ra-generacion',
      description: 'AirPods Pro con cancelación activa de ruido mejorada, modo transparencia adaptativo y hasta 6 horas de reproducción.',
      price: 289000,
      stock: 50,
      categoryId: electronicsCategory.id,
      images: [
        'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600'
      ],
    },

    // Fashion
    {
      name: 'Reloj Rolex Submariner',
      slug: 'rolex-submariner',
      description: 'Reloj Rolex Submariner clásico en acero inoxidable, resistente al agua hasta 300 metros. Un ícono de la relojería suiza.',
      price: 12500000,
      stock: 3,
      categoryId: fashionCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600',
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600'
      ],
    },
    {
      name: 'Cartera Louis Vuitton Monogram',
      slug: 'cartera-louis-vuitton-monogram',
      description: 'Cartera clásica Louis Vuitton en canvas Monogram con herrajes dorados. Diseño atemporal y elegante.',
      price: 850000,
      stock: 8,
      categoryId: fashionCategory.id,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'
      ],
    },
    {
      name: 'Zapatillas Nike Air Jordan 1 Retro',
      slug: 'nike-air-jordan-1-retro',
      description: 'Zapatillas icónicas Nike Air Jordan 1 Retro High OG. Diseño clásico que nunca pasa de moda.',
      price: 180000,
      stock: 20,
      categoryId: fashionCategory.id,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'
      ],
    },

    // Home & Decoration
    {
      name: 'Sofá Modular Herman Miller',
      slug: 'sofa-modular-herman-miller',
      description: 'Sofá modular de diseño contemporáneo de Herman Miller. Tapizado en cuero premium con estructura de madera sostenible.',
      price: 2200000,
      stock: 5,
      categoryId: homeCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'
      ],
    },
    {
      name: 'Lámpara Artemide Tolomeo',
      slug: 'lampara-artemide-tolomeo',
      description: 'Lámpara de escritorio Artemide Tolomeo, diseño italiano icónico con brazo articulado y acabado en aluminio.',
      price: 450000,
      stock: 12,
      categoryId: homeCategory.id,
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'
      ],
    },

    // Sports & Fitness
    {
      name: 'Bicicleta Trek Domane SL 7',
      slug: 'bicicleta-trek-domane-sl-7',
      description: 'Bicicleta de ruta Trek Domane SL 7 con cuadro de carbono OCLV 500 y sistema de suspensión IsoSpeed.',
      price: 3200000,
      stock: 4,
      categoryId: sportsCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1544191696-15693262e07d?w=600',
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600'
      ],
    },
    {
      name: 'Pesas Ajustables Bowflex',
      slug: 'pesas-ajustables-bowflex',
      description: 'Set de pesas ajustables Bowflex SelectTech 552, ajustables de 2.2 a 24 kg cada una.',
      price: 650000,
      stock: 10,
      categoryId: sportsCategory.id,
      images: [
        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600'
      ],
    },
  ]

  for (const productData of products) {
    await prisma.product.create({
      data: productData,
    })
  }

  // Create addresses for users
  console.log('📍 Creating user addresses...')
  const address1 = await prisma.address.create({
    data: {
      userId: clientUser1.id,
      name: 'Casa',
      street: 'Av. Apoquindo 1234, Depto 508',
      commune: 'Las Condes',
      city: 'Santiago',
      region: 'Región Metropolitana',
      zipCode: '7550000',
      phone: '+56 9 1111 1111',
      isDefault: true,
    },
  })

  const address2 = await prisma.address.create({
    data: {
      userId: clientUser2.id,
      name: 'Oficina',
      street: 'Av. Providencia 567, Oficina 12',
      commune: 'Providencia',
      city: 'Santiago',
      region: 'Región Metropolitana',
      zipCode: '7500000',
      phone: '+56 9 2222 2222',
      isDefault: true,
    },
  })

  const address3 = await prisma.address.create({
    data: {
      userId: clientUser3.id,
      name: 'Casa Principal',
      street: 'Calle Los Leones 890',
      commune: 'Ñuñoa',
      city: 'Santiago',
      region: 'Región Metropolitana',
      zipCode: '7750000',
      phone: '+56 9 3333 3333',
      isDefault: true,
    },
  })

  // Add secondary address for user 1
  await prisma.address.create({
    data: {
      userId: clientUser1.id,
      name: 'Trabajo',
      street: 'Av. El Bosque Norte 500, Piso 15',
      commune: 'Las Condes',
      city: 'Santiago',
      region: 'Región Metropolitana',
      zipCode: '7550000',
      phone: '+56 9 1111 2222',
      isDefault: false,
    },
  })

  // Create sample orders with different statuses
  console.log('🛒 Creating sample orders...')
  
  // Order 1 - Delivered (clientUser1)
  const order1 = await prisma.order.create({
    data: {
      userId: clientUser1.id,
      addressId: address1.id,
      status: OrderStatus.DELIVERED,
      subtotal: 289000,
      shippingCost: 3500,
      total: 292500,
      paymentStatus: PaymentStatus.APPROVED,
      preferenceId: 'PREF001234567',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),  // 8 days ago
    },
  })

  // Order 2 - Shipped (clientUser2)
  const order2 = await prisma.order.create({
    data: {
      userId: clientUser2.id,
      addressId: address2.id,
      status: OrderStatus.SHIPPED,
      subtotal: 180000,
      shippingCost: 4000,
      total: 184000,
      paymentStatus: PaymentStatus.APPROVED,
      preferenceId: 'PREF001234568',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),  // 1 day ago
    },
  })

  // Order 3 - Preparing (clientUser3)
  const order3 = await prisma.order.create({
    data: {
      userId: clientUser3.id,
      addressId: address3.id,
      status: OrderStatus.PREPARING,
      subtotal: 1650000,
      shippingCost: 4000,
      total: 1654000,
      paymentStatus: PaymentStatus.APPROVED,
      preferenceId: 'PREF001234569',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),  // 1 day ago
    },
  })

  // Order 4 - Paid (clientUser1)
  const order4 = await prisma.order.create({
    data: {
      userId: clientUser1.id,
      addressId: address1.id,
      status: OrderStatus.PAID,
      subtotal: 12500000,
      shippingCost: 3500,
      total: 12503500,
      paymentStatus: PaymentStatus.APPROVED,
      preferenceId: 'PREF001234570',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),      // 12 hours ago
    },
  })

  // Order 5 - Pending (clientUser2)
  const order5 = await prisma.order.create({
    data: {
      userId: clientUser2.id,
      addressId: address2.id,
      status: OrderStatus.PENDING,
      subtotal: 450000,
      shippingCost: 4000,
      total: 454000,
      paymentStatus: PaymentStatus.PENDING,
      preferenceId: 'PREF001234571',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  })

  // Add order items
  console.log('📦 Creating order items...')
  
  // Get products for order items
  const airpodsProduct = await prisma.product.findFirst({ where: { slug: 'airpods-pro-3ra-generacion' } })
  const jordanProduct = await prisma.product.findFirst({ where: { slug: 'nike-air-jordan-1-retro' } })
  const macbookProduct = await prisma.product.findFirst({ where: { slug: 'macbook-air-m3-15' } })
  const rolexProduct = await prisma.product.findFirst({ where: { slug: 'rolex-submariner' } })
  const lamparaProduct = await prisma.product.findFirst({ where: { slug: 'lampara-artemide-tolomeo' } })

  // Order 1 items (Delivered - AirPods)
  if (airpodsProduct) {
    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        productId: airpodsProduct.id,
        quantity: 1,
        price: 289000,
        total: 289000,
      },
    })
  }

  // Order 2 items (Shipped - Jordan)
  if (jordanProduct) {
    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        productId: jordanProduct.id,
        quantity: 1,
        price: 180000,
        total: 180000,
      },
    })
  }

  // Order 3 items (Preparing - MacBook)
  if (macbookProduct) {
    await prisma.orderItem.create({
      data: {
        orderId: order3.id,
        productId: macbookProduct.id,
        quantity: 1,
        price: 1650000,
        total: 1650000,
      },
    })
  }

  // Order 4 items (Paid - Rolex)
  if (rolexProduct) {
    await prisma.orderItem.create({
      data: {
        orderId: order4.id,
        productId: rolexProduct.id,
        quantity: 1,
        price: 12500000,
        total: 12500000,
      },
    })
  }

  // Order 5 items (Pending - Lámpara)
  if (lamparaProduct) {
    await prisma.orderItem.create({
      data: {
        orderId: order5.id,
        productId: lamparaProduct.id,
        quantity: 1,
        price: 450000,
        total: 450000,
      },
    })
  }

  // Create payment records for orders
  console.log('💳 Creating payment records...')
  
  // Payment for Order 1 (Delivered - Approved)
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      mercadopagoId: 'MP001234567',
      preferenceId: 'PREF001234567',
      collectionId: 'COL001234567',
      status: PaymentStatus.APPROVED,
      statusDetail: 'accredited',
      paymentType: 'credit_card',
      paymentMethod: 'visa',
      amount: 292500,
      transactionAmount: 292500,
      currency: 'CLP',
      externalReference: order1.id,
      dateCreated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dateApproved: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  })

  // Payment for Order 2 (Shipped - Approved)
  await prisma.payment.create({
    data: {
      orderId: order2.id,
      mercadopagoId: 'MP001234568',
      preferenceId: 'PREF001234568',
      collectionId: 'COL001234568',
      status: PaymentStatus.APPROVED,
      statusDetail: 'accredited',
      paymentType: 'debit_card',
      paymentMethod: 'master',
      amount: 184000,
      transactionAmount: 184000,
      currency: 'CLP',
      externalReference: order2.id,
      dateCreated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dateApproved: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })

  // Payment for Order 3 (Preparing - Approved)
  await prisma.payment.create({
    data: {
      orderId: order3.id,
      mercadopagoId: 'MP001234569',
      preferenceId: 'PREF001234569',
      collectionId: 'COL001234569',
      status: PaymentStatus.APPROVED,
      statusDetail: 'accredited',
      paymentType: 'bank_transfer',
      paymentMethod: 'pse',
      amount: 1654000,
      transactionAmount: 1654000,
      currency: 'CLP',
      externalReference: order3.id,
      dateCreated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dateApproved: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  })

  // Payment for Order 4 (Paid - Approved)
  await prisma.payment.create({
    data: {
      orderId: order4.id,
      mercadopagoId: 'MP001234570',
      preferenceId: 'PREF001234570',
      collectionId: 'COL001234570',
      status: PaymentStatus.APPROVED,
      statusDetail: 'accredited',
      paymentType: 'credit_card',
      paymentMethod: 'visa',
      amount: 12503500,
      transactionAmount: 12503500,
      currency: 'CLP',
      externalReference: order4.id,
      dateCreated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      dateApproved: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  })

  // Payment for Order 5 (Pending - Pending)
  await prisma.payment.create({
    data: {
      orderId: order5.id,
      preferenceId: 'PREF001234571',
      status: PaymentStatus.PENDING,
      statusDetail: 'pending_payment_waiting_transfer',
      amount: 454000,
      currency: 'CLP',
      externalReference: order5.id,
      dateCreated: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`👤 Users created: ${await prisma.user.count()}`)
  console.log(`📍 Addresses created: ${await prisma.address.count()}`)
  console.log(`📝 Access requests created: ${await prisma.accessRequest.count()}`)
  console.log(`🚚 Shipping zones created: ${await prisma.shippingZone.count()}`)
  console.log(`📦 Categories created: ${await prisma.category.count()}`)
  console.log(`🛍️ Products created: ${await prisma.product.count()}`)
  console.log(`🛒 Orders created: ${await prisma.order.count()}`)
  console.log(`📄 Order items created: ${await prisma.orderItem.count()}`)
  console.log(`💳 Payments created: ${await prisma.payment.count()}`)

  console.log('\n🔑 Test accounts created:')
  console.log('✅ Client 1: maria.gonzalez@email.com (Has 2 orders: delivered & paid)')
  console.log('✅ Client 2: carlos.rodriguez@email.com (Has 2 orders: shipped & pending)')
  console.log('✅ Client 3: ana.martinez@email.com (Has 1 order: preparing)')
  console.log('⏳ Pending: pedro.silva@email.com (Waiting for approval)')
  console.log('\n🔐 Admin access: panshowlate@gmail.com (Created on first login)')

  console.log('\n💡 Order statuses for testing:')
  console.log('📦 DELIVERED - Order completed successfully')
  console.log('🚛 SHIPPED - Order on the way')
  console.log('⚙️ PREPARING - Order being prepared')
  console.log('💳 PAID - Payment approved, preparing order')
  console.log('⏳ PENDING - Awaiting payment confirmation')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })