import { PrismaClient, UserRole, AccessRequestStatus, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning up existing data...')
    await prisma.orderItem.deleteMany()
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

  // Create Admin User
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@clubw.com',
      name: 'Admin Club W',
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })

  // Create some test client users
  console.log('👥 Creating client users...')
  const clientUser1 = await prisma.user.create({
    data: {
      email: 'maria.gonzalez@email.com',
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

  // Create pending users with access requests
  console.log('⏳ Creating pending users...')
  const pendingUser = await prisma.user.create({
    data: {
      email: 'ana.martinez@email.com',
      name: 'Ana Martínez',
      role: UserRole.PENDING,
      emailVerified: new Date(),
    },
  })

  // Create access request for pending user
  await prisma.accessRequest.create({
    data: {
      userId: pendingUser.id,
      status: AccessRequestStatus.PENDING,
      documents: [
        'https://example.com/cv-ana.pdf',
        'https://example.com/recommendation-ana.pdf'
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
      processedBy: adminUser.id,
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

  // Create addresses for users
  console.log('📍 Creating user addresses...')
  await prisma.address.create({
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

  await prisma.address.create({
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

  // Create some sample orders
  console.log('🛒 Creating sample orders...')
  const sampleOrder = await prisma.order.create({
    data: {
      userId: clientUser1.id,
      addressId: (await prisma.address.findFirst({ where: { userId: clientUser1.id } }))!.id,
      status: OrderStatus.DELIVERED,
      subtotal: 289000,
      shippingCost: 3500,
      total: 292500,
      paymentStatus: 'approved',
    },
  })

  // Add order items
  const airpodsProduct = await prisma.product.findFirst({ 
    where: { slug: 'airpods-pro-3ra-generacion' } 
  })

  if (airpodsProduct) {
    await prisma.orderItem.create({
      data: {
        orderId: sampleOrder.id,
        productId: airpodsProduct.id,
        quantity: 1,
        price: 289000,
        total: 289000,
      },
    })
  }

  // Create another order for different user
  const sampleOrder2 = await prisma.order.create({
    data: {
      userId: clientUser2.id,
      addressId: (await prisma.address.findFirst({ where: { userId: clientUser2.id } }))!.id,
      status: OrderStatus.SHIPPED,
      subtotal: 180000,
      shippingCost: 4000,
      total: 184000,
      paymentStatus: 'approved',
    },
  })

  const jordanProduct = await prisma.product.findFirst({ 
    where: { slug: 'nike-air-jordan-1-retro' } 
  })

  if (jordanProduct) {
    await prisma.orderItem.create({
      data: {
        orderId: sampleOrder2.id,
        productId: jordanProduct.id,
        quantity: 1,
        price: 180000,
        total: 180000,
      },
    })
  }

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

  console.log('\n🔑 Test credentials:')
  console.log('Admin: admin@clubw.com')
  console.log('Client 1: maria.gonzalez@email.com')
  console.log('Client 2: carlos.rodriguez@email.com')
  console.log('Pending: ana.martinez@email.com')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })