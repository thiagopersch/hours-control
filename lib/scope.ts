import { hasPermission } from "@/lib/permissions"

// The session's `user` type comes from next-auth's module augmentation, which
// isn't fully merged across the codebase (see other `as any` casts of
// `session.user`), so we accept a loose shape here rather than fight it.
type SessionArg = { user?: unknown } | null | undefined

/**
 * Regular users (role "user") are analysts logged into the system and must
 * only see demands linked to their own Analyst record. Users who can manage
 * analysts (admin-level roles, via the `analyst:read` permission) or are
 * super admins see everything.
 */
export function canViewAllAnalysts(session: SessionArg): boolean {
  const user = session?.user as
    | { isSuperAdmin?: boolean; permissions?: string[] }
    | undefined
  return !!user?.isSuperAdmin || hasPermission(user?.permissions, "analyst", "read")
}

/**
 * Returns the analystId a demand query must be restricted to, or `undefined`
 * when the user is allowed to see demands from every analyst.
 * Users without elevated permission and without a linked Analyst record get
 * a sentinel id that matches nothing, so they see an empty list instead of
 * everyone else's data.
 */
export function getDemandAnalystScope(session: SessionArg): string | undefined {
  if (canViewAllAnalysts(session)) return undefined

  const user = session?.user as { analystId?: string | null } | undefined
  return user?.analystId ?? "__no-linked-analyst__"
}
