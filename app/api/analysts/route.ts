import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = { organizationId, deletedAt: null }
  if (status) where.status = status
  if (search) where.name = { contains: search, mode: "insensitive" }

  const analysts = await prisma.analyst.findMany({
    where,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(analysts)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const body = await request.json()
  const analyst = await prisma.analyst.create({
    data: {
      ...body,
      organizationId,
    },
  })

  return NextResponse.json(analyst, { status: 201 })
}
