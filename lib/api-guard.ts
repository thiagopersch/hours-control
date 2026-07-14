import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { buildScopeWhere, canAccessRecord, getScope, type PolicySession, type Resource } from "@/lib/policy"

type NonNullableSessionUser = NonNullable<NonNullable<PolicySession>["user"]>

export type Guard = {
  // Narrower than PolicySession: requireScope only returns this after
  // confirming session.user exists, so callers don't need `!` everywhere.
  session: { user: NonNullableSessionUser }
  organizationId: string
  scopeWhere: Record<string, unknown>
}

/**
 * Standard entry-point guard for every API route: authenticates, resolves
 * the organization, and checks resource:action authorization. Returns a
 * ready-to-use `scopeWhere` fragment for list queries, or a NextResponse
 * (401/403) that the caller must return immediately.
 *
 * Usage:
 *   const guard = await requireScope(request, "client", "read")
 *   if (isGuardFailure(guard)) return guard
 *   const where = { organizationId: guard.organizationId, deletedAt: null, ...guard.scopeWhere }
 */
export async function requireScope(
  request: NextRequest,
  resource: Resource,
  action = "read"
): Promise<Guard | NextResponse> {
  const rawSession = await auth()
  if (!rawSession?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const session = rawSession as unknown as PolicySession

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const scope = getScope(session, resource, action)
  if (scope === "NONE") {
    return NextResponse.json(
      { error: "Você não tem permissão para realizar esta ação." },
      { status: 403 }
    )
  }

  const scopeWhere = buildScopeWhere(session, resource, action) ?? { id: "__no-access__" }
  return { session: session as { user: NonNullableSessionUser }, organizationId, scopeWhere }
}

export function isGuardFailure(result: Guard | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}

/**
 * For GET/PUT/DELETE by id: once a record has been fetched (already scoped
 * to the organization), verify it falls within the caller's scope.
 * `hideExistence` controls whether a denial looks like a 404 (default - per
 * spec, most resources should not confirm a record exists to someone who
 * isn't authorized to see it) or a 403 (Demand uses this, since the
 * frontend needs to distinguish "forbidden" to show its access-denied flow).
 */
export function assertRecordAccess(
  session: PolicySession,
  resource: Resource,
  action: string,
  record: Record<string, any> | null,
  hideExistence = true
): NextResponse | null {
  if (!record) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  }
  if (!canAccessRecord(session, resource, action, record)) {
    return hideExistence
      ? NextResponse.json({ error: "Não encontrado" }, { status: 404 })
      : NextResponse.json(
          { error: "Você não tem permissão para acessar este registro." },
          { status: 403 }
        )
  }
  return null
}
