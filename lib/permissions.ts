type SessionPermission = { resource: string; action: string; scope: string }

/**
 * True when the session has any access (scope other than NONE) to
 * resource:action. Used for coarse UI/route gating (nav visibility, page
 * access) - for data filtering, use `buildScopeWhere`/`canAccessRecord` from
 * `lib/policy.ts` instead, since those account for the actual scope.
 */
export function hasPermission(
  permissions: SessionPermission[] | undefined | null,
  resource: string,
  action = "read"
): boolean {
  if (!permissions) return false
  const perm = permissions.find((p) => p.resource === resource && p.action === action)
  return !!perm && perm.scope !== "NONE"
}
