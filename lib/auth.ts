import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import * as bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Login attempt:", credentials?.email)
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          console.log("Validation failed:", parsed.error.issues)
          return null
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email.toLowerCase()),
        })
        
        console.log("User found in DB:", user ? { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          is_active: user.is_active,
          is_active_type: typeof user.is_active,
          has_password: !!user.password,
          password_type: typeof user.password
        } : "NOT FOUND")

        if (!user || !user.password) {
          console.log("User or password missing")
          return null
        }

        // Check if user is active
        const isActive = String(user.is_active) === "true" || user.is_active === true
        if (!isActive) {
          console.log("User is not active. Value:", user.is_active, "Type:", typeof user.is_active)
          return null
        }

        console.log("Password from credentials length:", parsed.data.password.length)
        console.log("Password from DB length:", user.password.length)

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        console.log("Bcrypt compare result:", valid)

        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.nama_lengkap,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
