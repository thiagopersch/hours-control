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
  const analyst = await prisma.analyst.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!analyst) return NextResponse.json({ error: "Analyst not found" }, { status: 404 })

  return NextResponse.json(analyst)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.analyst.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "Analyst not found" }, { status: 404 })

  const body = await request.json()
  const analyst = await prisma.analyst.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(analyst)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.analyst.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "Analyst not found" }, { status: 404 })

  await prisma.analyst.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Analyst deleted" })
}
