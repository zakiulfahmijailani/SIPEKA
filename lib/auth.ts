import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { AdapterAccount, AdapterUser } from "next-auth/adapters"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { accounts, users } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { SUPER_ADMIN_EMAIL } from "@/lib/constants"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function effectiveRole(user: Pick<typeof users.$inferSelect, "email" | "role">) {
  const email = normalizeEmail(user.email)
  if (email === SUPER_ADMIN_EMAIL) return "SUPER_ADMIN" as const
  return user.role === "SUPER_ADMIN" ? "DOSEN" as const : user.role
}

const baseAdapter = DrizzleAdapter(db)

function toAdapterUser(user: typeof users.$inferSelect): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    name: user.nama_lengkap,
    emailVerified: null,
    image: null,
  }
}

const asText = (value: unknown) => (value == null ? null : String(value))

// SIPEKA already has its own user directory and role assignments. OAuth must
// authenticate those users, not silently create a new DOSEN account.
const adapter = {
  ...baseAdapter,
  async getUserByEmail(email: string) {
    const existing = await db.query.users.findFirst({
      where: and(eq(users.email, email.trim().toLowerCase()), eq(users.is_active, true)),
    })

    return existing ? toAdapterUser(existing) : null
  },
  async getUserByAccount(account: Pick<AdapterAccount, "provider" | "providerAccountId">) {
    const result = await db
      .select({ user: users })
      .from(accounts)
      .innerJoin(users, eq(accounts.userId, users.id))
      .where(
        and(
          eq(accounts.provider, account.provider),
          eq(accounts.providerAccountId, account.providerAccountId),
        ),
      )
      .limit(1)

    return result[0]?.user ? toAdapterUser(result[0].user) : null
  },
  async linkAccount(account: AdapterAccount) {
    await db.insert(accounts).values({
      userId: account.userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refresh_token: asText(account.refresh_token),
      access_token: asText(account.access_token),
      expires_at: asText(account.expires_at),
      token_type: asText(account.token_type),
      scope: asText(account.scope),
      id_token: asText(account.id_token),
      session_state: asText(account.session_state),
    })

    return account
  },
  async createUser(profile: AdapterUser) {
    const email = profile.email?.trim().toLowerCase()
    if (!email) throw new Error("Google account tidak memiliki email.")

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!existing || !existing.is_active) {
      throw new Error("Email Google belum terdaftar sebagai pengguna SIPEKA.")
    }

    return toAdapterUser(existing)
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      // Google verifies the account email. SIPEKA additionally verifies that
      // the email already exists in its own user table before allowing login.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true

      const email = user.email ? normalizeEmail(user.email) : undefined
      if (!email || profile?.email_verified === false) return false

      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      return existing?.is_active === true
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email
      if (!email) return token

      const dbUser = await db.query.users.findFirst({
        where: eq(users.email, normalizeEmail(email)),
      })

      if (dbUser?.is_active) {
        token.id = dbUser.id
        token.role = effectiveRole(dbUser)
        token.name = dbUser.nama_lengkap
        token.email = dbUser.email
      } else {
        token.id = undefined
        token.role = undefined
        token.name = undefined
        token.email = undefined
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
