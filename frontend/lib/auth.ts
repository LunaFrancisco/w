import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user role to session
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          // If user doesn't exist, create with PENDING role
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: "PENDING",
                emailVerified: new Date(),
              }
            })
          }

          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
})