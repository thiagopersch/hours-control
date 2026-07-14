import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "client", "read")
  if (isGuardFailure(guard)) return guard
  const { organizationId, scopeWhere } = guard

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = { organizationId, deletedAt: null, ...scopeWhere }
  if (status) where.status = status
  if (search) where.name = { contains: search, mode: "insensitive" }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(clients)
}

export async function POST(request: NextRequest) {
  const guard = await requireScope(request, "client", "create")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const body = await request.json()
  const client = await prisma.client.create({
    data: {
      ...body,
      organizationId,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(client, { status: 201 })
}
