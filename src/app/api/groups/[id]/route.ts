import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true }
            }
          }
        },
        expenses: {
            include: {
              paidBy: { select: { id: true, name: true, avatarColor: true } }
            },
            orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Fetch group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          select: { userId: true, role: true }
        }
      }
    });
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const isCreator = group.creatorId === user.userId;
    const isAdmin = group.members.some((member) => member.userId === user.userId && member.role === "admin");
    if (!isCreator && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.group.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
