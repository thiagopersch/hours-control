import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "demand_type", "read")
  if (isGuardFailure(guard)) return guard
  const { organizationId, scopeWhere } = guard

  const { searchParams } = request.nextUrl
  const search = searchParams.get("search")

  const where: Record<string, unknown> = { organizationId, deletedAt: null, ...scopeWhere }
  if (search) where.name = { contains: search, mode: "insensitive" }

  const demandTypes = await prisma.demandType.findMany({
    where,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(demandTypes)
}

export async function POST(request: NextRequest) {
  const guard = await requireScope(request, "demand_type", "create")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const body = await request.json()
  const demandType = await prisma.demandType.create({
    data: {
      ...body,
      organizationId,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(demandType, { status: 201 })
}
