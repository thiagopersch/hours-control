import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "department", "read")
  if (isGuardFailure(guard)) return guard
  const { organizationId, scopeWhere } = guard

  const { searchParams } = request.nextUrl
  const search = searchParams.get("search")

  const where: Record<string, unknown> = {
    organizationId,
    deletedAt: null,
    ...scopeWhere,
  }
  if (search) where.name = { contains: search, mode: "insensitive" }

  const departments = await prisma.department.findMany({
    where,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(departments)
}

export async function POST(request: NextRequest) {
  const guard = await requireScope(request, "department", "create")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const body = await request.json()

  const department = await prisma.department.create({
    data: { ...body, organizationId, createdById: session.user.id },
  })

  return NextResponse.json(department, { status: 201 })
}
