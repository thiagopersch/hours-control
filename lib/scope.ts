import { getScope, type PolicySession } from "@/lib/policy"

/**
 * Regular users (role "user") are analysts logged into the system and must
 * only see demands linked to their own Analyst record. Users whose
 * `analyst:read` scope is COMPANY/ALL (or super admins) see everyone's.
 */
export function canViewAllAnalysts(session: PolicySession): boolean {
  const scope = getScope(session, "analyst", "read")
  return scope === "COMPANY" || scope === "ALL"
}

/**
 * Returns the analystId a demand query must be restricted to, or `undefined`
 * when the user is allowed to see demands from every analyst.
 * Users without elevated permission and without a linked Analyst record get
 * a sentinel id that matches nothing, so they see an empty list instead of
 * everyone else's data.
 */
export function getDemandAnalystScope(session: PolicySession): string | undefined {
  if (canViewAllAnalysts(session)) return undefined

  const user = session?.user
  return user?.analystId ?? "__no-linked-analyst__"
}
