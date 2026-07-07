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
  const clientId = searchParams.get("clientId")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {
    client: { organizationId },
    deletedAt: null,
  }
  if (clientId) where.clientId = clientId
  if (status) where.status = status

  const contracts = await prisma.clientContract.findMany({
    where,
    include: { client: { select: { id: true, name: true } } },
    orderBy: { startDate: "desc" },
  })

  return NextResponse.json(contracts)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const body = await request.json()

  const client = await prisma.client.findFirst({
    where: { id: body.clientId, organizationId, deletedAt: null },
  })
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

  const contract = await prisma.clientContract.create({
    data: {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    },
    include: { client: { select: { id: true, name: true } } },
  })

  return NextResponse.json(contract, { status: 201 })
}
