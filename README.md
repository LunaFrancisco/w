This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Required
- `DATABASE_URL` - PostgreSQL database connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth.js
- `NEXTAUTH_URL` - Application URL (http://localhost:3000 for dev)

### Google OAuth
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Payment Gateways

#### MercadoPago
- `MP_ACCESS_TOKEN` - MercadoPago access token
- `MP_PUBLIC_KEY` - MercadoPago public key
- `MP_WEBHOOK_SECRET` - MercadoPago webhook secret

#### Flow.cl
- `FLOW_API_KEY` - Flow.cl API key
- `FLOW_SECRET_KEY` - Flow.cl secret key for HMAC signatures
- `FLOW_SANDBOX_MODE` - Set to `true` for testing, `false` for production

### Optional
- `SUPABASE_*` - Supabase configuration (if using)
- `RESEND_API_KEY` - Resend API key for emails
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` - Microsoft Clarity analytics

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
