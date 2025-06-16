import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { UserRole } from "@prisma/client"

// Define extended types for NextAuth
interface ExtendedUser {
  id: string;
  role?: UserRole;
}

interface ExtendedSession {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
  }
}

// Create a version of NextAuth specifically for Edge runtime
// that doesn't depend on Prisma directly
export const { handlers: edgeHandlers, auth: edgeAuth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Add user data to JWT token
      if (user) {
        token.id = user.id
        // Set default role to PENDING if not present
        token.role = (user as ExtendedUser).role || "PENDING"
      }
      
      // Handle updates
      if (trigger === "update" && session) {
        const extendedSession = session as ExtendedSession
        if (extendedSession.user?.role) {
          token.role = extendedSession.user.role
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Add user role to session from JWT token
      if (session.user && token) {
        session.user.id = token.id as string
        // Add role to session.user with proper typing
        const extendedSession = session as ExtendedSession
        if (extendedSession.user) {
          extendedSession.user.role = (token.role as UserRole) || "PENDING"
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})
