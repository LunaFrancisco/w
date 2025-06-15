# 📋 Plan de Arquitectura para Club W

## 🏗️ Estructura del Proyecto

```text
clubW/
├── frontend/                    # Next.js App Router
│   ├── app/                    # App Router structure
│   │   ├── (public)/          # Sitio público
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── contacto/      # Página de contacto
│   │   │   ├── solicitud-acceso/ # Formulario de acceso
│   │   │   └── layout.tsx     # Layout público
│   │   ├── (portal)/          # Portal privado
│   │   │   ├── dashboard/     # Dashboard usuario
│   │   │   ├── productos/     # Catálogo
│   │   │   ├── carrito/       # Carrito de compras
│   │   │   ├── pedidos/       # Historial pedidos
│   │   │   ├── perfil/        # Perfil usuario
│   │   │   └── layout.tsx     # Layout privado
│   │   ├── admin/             # Panel administrativo
│   │   │   ├── dashboard/     # Métricas y ventas
│   │   │   ├── usuarios/      # Gestión usuarios
│   │   │   ├── productos/     # Gestión inventario
│   │   │   ├── pedidos/       # Gestión pedidos
│   │   │   └── solicitudes/   # Validar accesos
│   │   └── api/               # API routes
│   │       ├── auth/          # NextAuth endpoints
│   │       ├── mercadopago/   # Webhooks MP
│   │       ├── upload/        # Upload archivos
│   │       └── ...            # Otras APIs
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes base
│   │   ├── forms/            # Formularios
│   │   ├── ecommerce/        # Componentes tienda
│   │   └── auth/             # Componentes auth
│   ├── lib/                   # Utilidades y configuración
│   │   ├── prisma.ts         # Cliente Prisma
│   │   ├── supabase.ts       # Cliente Supabase
│   │   ├── mercadopago.ts    # Configuración MP
│   │   ├── auth.ts           # NextAuth config
│   │   └── utils.ts          # Utilidades
│   └── prisma/               # Schema y migraciones
│       ├── schema.prisma
│       └── migrations/
├── cms/                      # Strapi CMS
│   ├── config/
│   ├── src/
│   └── ...
└── docs/                     # Documentación
    ├── README.md
    ├── deployment.md
    └── api.md
```

## 🎯 Fases de Desarrollo

**Fase 1: Configuración Base**

- ✅ Inicializar proyecto Next.js 14 con TypeScript
- ✅ Configurar Prisma con Supabase PostgreSQL
- ✅ Setup inicial de Strapi CMS
- ✅ Configurar NextAuth.js con Google SSO
- ✅ Implementar sistema de roles (admin, cliente, pendiente)
- ✅ Setup Tailwind CSS + shadcn/ui

**Fase 2: Sitio Público**

- 🏢 Página homepage institucional responsive
- 📧 Formulario de contacto con validación
- 📝 Formulario de solicitud de acceso con upload de documentos
- 🗂️ Integración con Supabase Storage para documentos
- ♿ Implementación de accesibilidad WCAG 2.1
- 📱 Diseño mobile-first

**Fase 3: Portal Privado - Base**

- 🔐 Sistema de autenticación con Google SSO
- 🚫 Middleware de autorización para rutas privadas
- 👤 Dashboard de usuario básico
- ⚙️ Página de gestión de perfil
- 📍 Sistema de direcciones de envío
- 🏗️ Estructura base del ecommerce

**Fase 4: Funcionalidad Ecommerce**

- 🛍️ Catálogo de productos con filtros y búsqueda
- 🛒 Carrito de compras persistente
- 🚚 Sistema de zonas de envío por comuna con costos
- 💳 Integración completa con MercadoPago
- 📦 Sistema de gestión de pedidos con estados
- 📧 Notificaciones por email de pedidos

**Fase 5: Panel Administrativo**

- 📊 Dashboard de ventas con métricas y gráficos
- 👥 Gestión completa de usuarios/clientes
- 📦 Gestión de inventario (CRUD productos)
- ✅ Sistema de validación de solicitudes de acceso
- 🔄 Gestión de estados de pedidos
- 📈 Reportes de ventas

**Fase 6: Optimización y Deploy**

- ⚡ Optimización de performance (caching, imágenes)
- 🔍 SEO avanzado y meta tags
- 🔔 Sistema de notificaciones internas (opcional)
- 🧪 Testing automatizado
- 🚀 Configuración de deployment
- 📚 Documentación completa

## 🔧 Stack Tecnológico Detallado

### Frontend (Next.js 14)

- Framework: Next.js 14 con App Router
- Styling: Tailwind CSS + shadcn/ui
- Formularios: React Hook Form + Zod validation
- Estado: Zustand para estado global
- HTTP Client: Axios o fetch nativo
- Imágenes: Next.js Image optimization

### Autenticación & SSO

- Auth Provider: NextAuth.js v5
- SSO: Google OAuth 2.0
- Session: JWT + Database sessions
- Roles: Admin, Cliente, Pendiente

### Backend & Base de Datos

- Database: Supabase (PostgreSQL)
- ORM: Prisma ORM
- Storage: Supabase Storage para archivos
- API: Next.js API Routes
- Validation: Zod schemas

### CMS & Contenido

- CMS: Strapi v4 headless CMS
- Content: Páginas institucionales, políticas
- Media: Gestión de imágenes institucionales

### Pagos & Servicios

- Pagos: MercadoPago SDK
- Webhooks: MercadoPago notifications
- Emails: Resend o Nodemailer
- Upload: Supabase Storage

## 📊 Estructura de Base de Datos

### Esquema Principal

**-- Usuarios del sistema**
```sql
users {
  id: string (UUID)
  email: string (unique)
  name: string
  image: string?
  role: enum (ADMIN, CLIENT, PENDING)
  googleId: string (unique)
  createdAt: datetime
  updatedAt: datetime
}
```

**-- Solicitudes de acceso**
```sql
access_requests {
  id: string (UUID)
  userId: string (FK users)
  status: enum (PENDING, APPROVED, REJECTED)
  documents: json[] // URLs de documentos
  adminNotes: string?
  createdAt: datetime
  processedAt: datetime?
  processedBy: string? (FK users)
}
```

**-- Direcciones de envío**
```sql
addresses {
  id: string (UUID)
  userId: string (FK users)
  name: string
  street: string
  commune: string
  city: string
  region: string
  zipCode: string
  phone: string
  isDefault: boolean
}
```

**-- Zonas de envío**
```sql
shipping_zones {
  id: string (UUID)
  commune: string (unique)
  cost: decimal
  deliveryDays: integer
  active: boolean
}
```

**-- Categorías de productos**
```sql
categories {
  id: string (UUID)
  name: string
  slug: string (unique)
  description: string?
  image: string?
  active: boolean
}
```

**-- Productos**
```sql
products {
  id: string (UUID)
  name: string
  slug: string (unique)
  description: text
  price: decimal
  stock: integer
  images: json[] // URLs de imágenes
  categoryId: string (FK categories)
  active: boolean
  featured: boolean
  createdAt: datetime
  updatedAt: datetime
}
```

**-- Pedidos**
```sql
orders {
  id: string (UUID)
  userId: string (FK users)
  addressId: string (FK addresses)
  status: enum (PENDING, PAID, PREPARING, SHIPPED, DELIVERED, CANCELLED)
  subtotal: decimal
  shippingCost: decimal
  total: decimal
  mercadopagoId: string?
  paymentStatus: string
  createdAt: datetime
  updatedAt: datetime
}
```

**-- Items de pedidos**
```sql
order_items {
  id: string (UUID)
  orderId: string (FK orders)
  productId: string (FK products)
  quantity: integer
  price: decimal // precio al momento del pedido
  total: decimal
}
```

## 🎨 Consideraciones UX/UI

### Diseño & Accesibilidad

- 📱 Diseño mobile-first responsive
- ♿ Cumplimiento WCAG 2.1 AA
- 🎨 Sistema de design tokens consistente
- 🔤 Tipografía legible y contraste adecuado
- ⌨️ Navegación por teclado completa
- 🔊 Screen reader compatibility

### Performance & UX

- ⚡ Loading states y skeleton screens
- 🖼️ Lazy loading de imágenes
- 💾 Persistencia de carrito
- 🔄 Optimistic updates
- 📊 Feedback visual para todas las acciones
- 🚀 Caching inteligente

## 🔒 Seguridad & Compliance

### Autenticación & Autorización

- 🔐 Google SSO obligatorio
- 🛡️ Middleware de protección de rutas
- 🎫 JWT tokens seguros
- 🔒 Rate limiting en APIs críticas
- 🚫 Validación de roles en backend

### Seguridad de Datos

- 🧹 Sanitización de inputs
- ✅ Validación server-side con Zod
- 🗂️ Upload seguro de archivos
- 🔐 Encriptación de datos sensibles
- 📋 Logs de seguridad

### Compliance

- 📜 Políticas de privacidad
- 🍪 Gestión de cookies
- 🔒 HTTPS obligatorio
- 💾 Backup automático de datos

## 🚀 Plan de Deployment

### Entornos

- Desarrollo: Local con Docker
- Staging: Vercel + Supabase staging
- Producción: Vercel + Supabase prod

### CI/CD

- GitHub Actions para deployment
- Tests automatizados
- Linting y type checking
- Build optimization

### Monitoreo

- Error tracking con Sentry
- Analytics con Google Analytics
- Performance monitoring
- Uptime monitoring
