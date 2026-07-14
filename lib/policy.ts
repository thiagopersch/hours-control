import type { PermissionScope } from "@/lib/generated/prisma/client"

export type Resource =
  | "demand"
  | "client"
  | "analyst"
  | "contract"
  | "requester"
  | "department"
  | "demand_type"
  | "tag"
  | "user"
  | "role"
  | "report"
  | "notification"
  | "settings"
  | "team"

export type SessionPermission = { resource: string; action: string; scope: PermissionScope }

export type PolicySession = {
  user?: {
    id: string
    organizationId: string
    isSuperAdmin?: boolean
    analystId?: string | null
    clientId?: string | null
    teamId?: string | null
    departmentId?: string | null
    permissions?: SessionPermission[] | null
  }
} | null | undefined

/**
 * Resolves the scope a session has for resource:action. Super admins always
 * get ALL. Everyone else is looked up in their flattened role permissions;
 * a missing row means NONE (no access) - the default-deny posture the whole
 * authorization system is built on.
 */
export function getScope(session: PolicySession, resource: Resource, action = "read"): PermissionScope {
  const user = session?.user
  if (!user) return "NONE"
  if (user.isSuperAdmin) return "ALL"
  const perm = user.permissions?.find((p) => p.resource === resource && p.action === action)
  return perm?.scope ?? "NONE"
}

export function hasAccess(session: PolicySession, resource: Resource, action = "read"): boolean {
  return getScope(session, resource, action) !== "NONE"
}

/**
 * Field on each resource's model that identifies its "owner" for OWN scope,
 * once Demand's special client/analyst handling doesn't apply. `"id"` for
 * User means the record itself IS the user (own = my own account).
 * Resources with no natural single-record owner (role, permission,
 * settings, report) are omitted - OWN degrades to company-wide for them
 * rather than crashing on a non-existent column.
 */
const OWNER_FIELD: Partial<Record<Resource, string>> = {
  user: "id",
  notification: "userId",
  report: "userId",
  client: "createdById",
  // "own" for Analyst means "the analyst record linked to my account" (so an
  // analyst can always see/select themselves), not "created by me".
  analyst: "userId",
  contract: "createdById",
  requester: "createdById",
  department: "createdById",
  demand_type: "createdById",
  tag: "createdById",
  team: "createdById",
}

/**
 * Prisma `where` fragment that narrows a list query to what the session is
 * allowed to see. Callers must always AND this with the base
 * `{ organizationId, deletedAt: null }` filter - COMPANY/ALL intentionally
 * return `{}` here because organization isolation is handled there, not here.
 *
 * Returns `null` when the caller has no access at all (scope NONE) - the
 * route should reject the request rather than run the query.
 */
export function buildScopeWhere(
  session: PolicySession,
  resource: Resource,
  action = "read"
): Record<string, unknown> | null {
  const scope = getScope(session, resource, action)
  if (scope === "NONE") return null
  if (scope === "ALL" || scope === "COMPANY") return {}

  const user = session?.user
  if (!user) return null

  if (resource === "demand") {
    if (scope === "OWN") {
      if (user.clientId) return { clientId: user.clientId }
      if (user.analystId) return { analystId: user.analystId }
      return { id: "__no-access__" }
    }
    if (scope === "TEAM") {
      return user.teamId ? { analyst: { teamId: user.teamId } } : { id: "__no-access__" }
    }
    if (scope === "DEPARTMENT") {
      return user.departmentId ? { departmentId: user.departmentId } : { id: "__no-access__" }
    }
  }

  // Master-data resources have no per-record team/department tag; OWN is
  // resolved through each resource's owner field (see OWNER_FIELD).
  // TEAM/DEPARTMENT fall back to company-wide visibility since there's no
  // finer-grained ownership to filter master data by.
  if (scope === "OWN") {
    const field = OWNER_FIELD[resource]
    return field ? { [field]: user.id } : {}
  }
  return {}
}

/**
 * Single-record authorization check for GET/PUT/DELETE by id, once the
 * record has already been fetched (and confirmed to belong to the caller's
 * organization). `record` should include whatever relations the resource's
 * scope needs - e.g. Demand needs `analyst: { teamId }` included for TEAM
 * scope to be checkable.
 */
export function canAccessRecord(
  session: PolicySession,
  resource: Resource,
  action: string,
  record: Record<string, any>
): boolean {
  const scope = getScope(session, resource, action)
  if (scope === "NONE") return false
  if (scope === "ALL" || scope === "COMPANY") return true

  const user = session?.user
  if (!user) return false

  if (resource === "demand") {
    if (scope === "OWN") {
      if (user.clientId) return record.clientId === user.clientId
      if (user.analystId) return record.analystId === user.analystId
      return false
    }
    if (scope === "TEAM") return !!user.teamId && record.analyst?.teamId === user.teamId
    if (scope === "DEPARTMENT") return !!user.departmentId && record.departmentId === user.departmentId
  }

  if (scope === "OWN") {
    const field = OWNER_FIELD[resource]
    return field ? record[field] === user.id : true
  }
  return true
}
