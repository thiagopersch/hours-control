import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { verify } from "@node-rs/argon2"

import { prisma } from "./prisma"
import { logger } from "./logger"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              organization: true,
              analyst: { select: { id: true } },
              userRoles: {
                include: {
                  role: {
                    include: {
                      rolePermissions: {
                        include: { permission: true },
                      },
                    },
                  },
                },
              },
            },
          })

          if (!user?.passwordHash) return null
          if (user.status !== "active") return null

          const isValid = await verify(user.passwordHash, password)
          if (!isValid) return null

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          const permissions = user.userRoles.flatMap((ur: typeof user.userRoles[0]) =>
            ur.role.rolePermissions.map((rp: typeof ur.role.rolePermissions[0]) => rp.permission)
          )

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            organizationId: user.organizationId,
            organizationSlug: user.organization.slug,
            mustChangePassword: user.mustChangePassword,
            isSuperAdmin: user.isSuperAdmin,
            analystId: user.analyst?.id ?? null,
            permissions: permissions.map((p: typeof permissions[0]) => `${p.resource}:${p.action}`),
          }
        } catch (error) {
          logger.error({ error }, "Authentication error")
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.organizationId = (user as any).organizationId
        token.organizationSlug = (user as any).organizationSlug
        token.permissions = (user as any).permissions
        token.mustChangePassword = (user as any).mustChangePassword
        token.isSuperAdmin = (user as any).isSuperAdmin
        token.analystId = (user as any).analystId
      }
      if (trigger === "update" && session && "mustChangePassword" in session) {
        token.mustChangePassword = session.mustChangePassword
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).organizationId = token.organizationId
        ;(session.user as any).organizationSlug = token.organizationSlug
        ;(session.user as any).permissions = token.permissions
        ;(session.user as any).mustChangePassword = token.mustChangePassword
        ;(session.user as any).isSuperAdmin = token.isSuperAdmin
        ;(session.user as any).analystId = token.analystId
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  trustHost: true,
})
