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
  const search = searchParams.get("search")

  const where: Record<string, unknown> = {
    organizationId,
    deletedAt: null,
  }
  if (search) where.name = { contains: search, mode: "insensitive" }

  const departments = await prisma.department.findMany({
    where,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(departments)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const body = await request.json()

  const department = await prisma.department.create({
    data: body,
  })

  return NextResponse.json(department, { status: 201 })
}
