import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { UserRole } from "@prisma/client"

// This file is used for server-side authentication handling
// It should only be imported in server components or API routes
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to JWT token
      if (user) {
        token.id = user.id
        token.role = user.role || "PENDING"
      }
      return token
    },
    async session({ session, user, token }) {
      // For JWT strategy
      if (token && !user) {
        if (session.user) {
          session.user.id = token.id as string
          session.user.role = (token.role as UserRole) || "PENDING" as UserRole
        }
        return session
      }

      // For database strategy - add user role to session
      if (session.user && user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })
        
        session.user.id = user.id
        session.user.role = dbUser?.role || "PENDING"
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          console.log("Existing user:", existingUser)

          if (!existingUser) {
            const isAdmin = user.email === "panshowlate@gmail.com"
            
            if (isAdmin) {
              await prisma.user.create({
                data: {
                  email: user.email!,
                  name: user.name,
                  image: user.image,
                  role: "ADMIN",
                  emailVerified: new Date(),
                }
              })
              return true
            } else {
              console.log("Access denied for non-existing user:", user.email)
              return false
            }
          }

          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirects after sign in
      if (url.startsWith("/") || url.startsWith(baseUrl)) {
        // Default redirect for now - we'll handle role-based redirects client-side
        return url.startsWith(baseUrl) ? url : baseUrl
      }
      return url
    },
  },  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  // Enable both strategies for compatibility
  session: {
    strategy: "jwt", // Use JWT strategy which is more compatible with Edge
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})