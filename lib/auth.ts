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
              analyst: { select: { id: true, teamId: true, departmentId: true } },
              client: { select: { id: true } },
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

          const rolePermissions = user.userRoles.flatMap(
            (ur: typeof user.userRoles[0]) => ur.role.rolePermissions
          )
          // Multiple roles can grant the same resource:action at different
          // scopes - keep the widest one (ALL > COMPANY > DEPARTMENT > TEAM > OWN > NONE).
          const scopeRank: Record<string, number> = {
            NONE: 0, OWN: 1, TEAM: 2, DEPARTMENT: 3, COMPANY: 4, ALL: 5,
          }
          const permissionMap = new Map<string, { resource: string; action: string; scope: string }>()
          for (const rp of rolePermissions) {
            const key = `${rp.permission.resource}:${rp.permission.action}`
            const existing = permissionMap.get(key)
            if (!existing || scopeRank[rp.scope] > scopeRank[existing.scope]) {
              permissionMap.set(key, {
                resource: rp.permission.resource,
                action: rp.permission.action,
                scope: rp.scope,
              })
            }
          }

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
            teamId: user.analyst?.teamId ?? null,
            departmentId: user.analyst?.departmentId ?? null,
            clientId: user.client?.id ?? null,
            permissions: Array.from(permissionMap.values()),
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
        token.teamId = (user as any).teamId
        token.departmentId = (user as any).departmentId
        token.clientId = (user as any).clientId
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
        ;(session.user as any).teamId = token.teamId
        ;(session.user as any).departmentId = token.departmentId
        ;(session.user as any).clientId = token.clientId
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
