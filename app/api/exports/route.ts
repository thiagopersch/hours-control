import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const exportCreateSchema = z.object({
  type: z.string().min(1),
  format: z.enum(["XLSX", "PDF", "CSV", "JSON"]),
  filters: z.record(z.string(), z.any()).optional(),
})

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const exports = await prisma.export.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(exports)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

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
