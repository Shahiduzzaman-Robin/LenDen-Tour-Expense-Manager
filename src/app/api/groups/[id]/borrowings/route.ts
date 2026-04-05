import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const prismaClient = prisma as any;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        members: {
          select: { userId: true },
        },
      },
    });

    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const isMember = group.members.some((member) => member.userId === user.userId);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const borrowings = await prismaClient.borrowing.findMany({
      where: { groupId: id },
      include: {
        from: { select: { id: true, name: true } },
        to: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(borrowings);
  } catch (error) {
    console.error("Fetch borrowings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, fromId, toId, description } = await request.json();

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    if (!fromId || !toId || fromId === toId) {
      return NextResponse.json({ error: "Borrowing must be between two different members" }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        members: {
          select: { userId: true },
        },
      },
    });

    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const memberIds = new Set(group.members.map((member) => member.userId));
    if (!memberIds.has(fromId) || !memberIds.has(toId)) {
      return NextResponse.json({ error: "Both users must be members of this group" }, { status: 400 });
    }

    if (!memberIds.has(user.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const borrowing = await prismaClient.borrowing.create({
      data: {
        amount: parsedAmount,
        fromId,
        toId,
        groupId: id,
        description: description || null,
      },
      include: {
        from: { select: { id: true, name: true } },
        to: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(borrowing);
  } catch (error) {
    console.error("Create borrowing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const borrowingId = searchParams.get("borrowingId");
    if (!borrowingId) {
      return NextResponse.json({ error: "Borrowing ID required" }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        members: {
          select: { userId: true },
        },
      },
    });

    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const isMember = group.members.some((member) => member.userId === user.userId);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const borrowing = await prismaClient.borrowing.findUnique({
      where: { id: borrowingId },
      select: { id: true, groupId: true },
    });

    if (!borrowing) return NextResponse.json({ error: "Borrowing not found" }, { status: 404 });
    if (borrowing.groupId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prismaClient.borrowing.delete({
      where: { id: borrowingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete borrowing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
