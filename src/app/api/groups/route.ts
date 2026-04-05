import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: { userId: user.userId }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        creatorId: true,
        updatedAt: true,
        members: {
          select: {
            id: true,
            userId: true,
            groupId: true,
            role: true,
            joinedAt: true,
            user: {
              select: { id: true, name: true, email: true, avatarColor: true }
            }
          }
        },
        expenses: {
          select: {
            id: true,
            title: true,
            amount: true,
            createdAt: true,
            paidBy: { select: { name: true } }
          }
        },
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Fetch groups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description, category, members } = await request.json();

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Create group and add creator as admin
    const group = await prisma.group.create({
      data: {
        name,
        description,
        category: category || "other",
        creatorId: user.userId,
        members: {
          create: [
            { userId: user.userId, role: "admin" },
            ...(members || []).map((id: string) => ({ userId: id, role: "member" }))
          ]
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
