import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { AdapterUser } from "next-auth/adapters"
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

const baseAdapter = DrizzleAdapter(db)

// SIPEKA already has its own user directory and role assignments. OAuth must
// authenticate those users, not silently create a new DOSEN account.
const adapter = {
  ...baseAdapter,
  async createUser(profile: AdapterUser) {
    const email = profile.email?.trim().toLowerCase()
    if (!email) throw new Error("Google account tidak memiliki email.")

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!existing || !existing.is_active) {
      throw new Error("Email Google belum terdaftar sebagai pengguna SIPEKA.")
    }

    return {
      ...profile,
      id: existing.id,
      email: existing.email,
      name: existing.nama_lengkap,
    }
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
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
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email.toLowerCase()),
        })
        
        if (!user || !user.password) return null

        // Check if user is active
        const isActive = user.is_active === true
        if (!isActive) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.nama_lengkap,
          role: user.role,
        }
      },
    }),
    Google({
      // Google verifies the account email. SIPEKA additionally verifies that
      // the email already exists in its own user table before allowing login.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true

      const email = user.email?.trim().toLowerCase()
      if (!email || profile?.email_verified === false) return false

      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      return existing?.is_active === true
    },
    async jwt({ token, user }) {
      const email = (user?.email ?? token.email)?.trim().toLowerCase()
      if (!email) return token

      const dbUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (dbUser?.is_active) {
        token.id = dbUser.id
        token.role = dbUser.role
        token.name = dbUser.nama_lengkap
        token.email = dbUser.email
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
