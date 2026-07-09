import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(session.user as any).isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const search = searchParams.get("search")

  const where: Record<string, unknown> = { deletedAt: null }
  if (search) where.name = { contains: search, mode: "insensitive" }

  const organizations = await prisma.organization.findMany({
    where,
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(organizations)
}
