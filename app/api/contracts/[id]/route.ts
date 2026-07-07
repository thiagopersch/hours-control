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
  const contract = await prisma.clientContract.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
    include: { client: { select: { id: true, name: true } } },
  })

  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 })

  return NextResponse.json(contract)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.clientContract.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "Contract not found" }, { status: 404 })

  const body = await request.json()
  const contract = await prisma.clientContract.update({
    where: { id },
    data: {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    },
    include: { client: { select: { id: true, name: true } } },
  })

  return NextResponse.json(contract)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.clientContract.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "Contract not found" }, { status: 404 })

  await prisma.clientContract.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Contract deleted" })
}
