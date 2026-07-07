import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const demand = await prisma.demand.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
    include: {
      analyst: { select: { id: true, name: true, email: true, color: true } },
      client: { select: { id: true, name: true, document: true } },
      requester: { select: { id: true, name: true, email: true } },
      department: { select: { id: true, name: true } },
      demandType: { select: { id: true, name: true, color: true } },
      demandTags: { include: { tag: true } },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!demand) return NextResponse.json({ error: "Demand not found" }, { status: 404 })

  return NextResponse.json(demand)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.demand.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "Demand not found" }, { status: 404 })

  const body = await request.json()
  const { tags, ...demandData } = body

  if (tags) {
    await prisma.demandTag.deleteMany({ where: { demandId: id } })
  }

  const demand = await prisma.demand.update({
    where: { id },
    data: {
      ...demandData,
      date: demandData.date ? new Date(demandData.date) : undefined,
      startTime: demandData.startTime ? new Date(demandData.startTime) : undefined,
      endTime: demandData.endTime ? new Date(demandData.endTime) : undefined,
      demandTags: tags
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

  return NextResponse.json(demand)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.demand.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "Demand not found" }, { status: 404 })

  await prisma.demand.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Demand deleted" })
}
