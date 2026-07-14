import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

const exportCreateSchema = z.object({
  type: z.string().min(1),
  format: z.enum(["XLSX", "PDF", "CSV", "JSON"]),
  filters: z.record(z.string(), z.any()).optional(),
})

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "report", "read")
  if (isGuardFailure(guard)) return guard
  const { organizationId, scopeWhere } = guard

  const exports = await prisma.export.findMany({
    where: { organizationId, ...scopeWhere },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(exports)
}

export async function POST(request: NextRequest) {
  const guard = await requireScope(request, "report", "create")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard
  const userId = session.user.id

  const body = await request.json()
  const parsed = exportCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const exportRecord = await prisma.export.create({
    data: {
      type: parsed.data.type,
      format: parsed.data.format,
      filters: parsed.data.filters,
      status: "COMPLETED",
      completedAt: new Date(),
      organizationId,
      userId,
    },
  })

  return NextResponse.json(exportRecord, { status: 201 })
}
