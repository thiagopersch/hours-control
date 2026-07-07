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
  const analystId = searchParams.get("analystId")
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "50", 10)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    client: { organizationId },
    deletedAt: null,
  }
  if (clientId) where.clientId = clientId
  if (analystId) where.analystId = analystId
  if (status) where.status = status
  if (priority) where.priority = priority
  if (search) where.name = { contains: search, mode: "insensitive" }
  if (startDate || endDate) {
    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)
    where.date = dateFilter
  }

  const [demands, total] = await Promise.all([
    prisma.demand.findMany({
      where,
      include: {
        analyst: { select: { id: true, name: true, color: true } },
        client: { select: { id: true, name: true } },
        requester: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        demandType: { select: { id: true, name: true, color: true } },
        demandTags: { include: { tag: true } },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.demand.count({ where }),
  ])

  return NextResponse.json({
    data: demands,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const body = await request.json()
  const { tags, ...demandData } = body

  const client = await prisma.client.findFirst({
    where: { id: demandData.clientId, organizationId, deletedAt: null },
  })
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

  const analyst = await prisma.analyst.findFirst({
    where: { id: demandData.analystId, organizationId, deletedAt: null },
  })
  if (!analyst) return NextResponse.json({ error: "Analyst not found" }, { status: 404 })

  const demand = await prisma.demand.create({
    data: {
      ...demandData,
      date: demandData.date ? new Date(demandData.date) : new Date(),
      startTime: demandData.startTime ? new Date(demandData.startTime) : undefined,
      endTime: demandData.endTime ? new Date(demandData.endTime) : undefined,
      demandTags: tags?.length
        ? {
            create: tags.map((tagId: string) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
    },
    include: {
      analyst: { select: { id: true, name: true, color: true } },
      client: { select: { id: true, name: true } },
      requester: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
      demandType: { select: { id: true, name: true, color: true } },
      demandTags: { include: { tag: true } },
    },
  })

  return NextResponse.json(demand, { status: 201 })
}
