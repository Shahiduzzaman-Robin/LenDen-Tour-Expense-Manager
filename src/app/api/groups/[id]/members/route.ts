import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email } = await request.json();

    // 1. If it's an email invite (legacy logic)
    if (email) {
      const targetUser = await prisma.user.findUnique({ where: { email } });
      if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
      
      const existing = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: id, userId: targetUser.id } }
      });
      if (existing) return NextResponse.json({ error: "User already in group" }, { status: 400 });

      const membership = await prisma.groupMember.create({ data: { groupId: id, userId: targetUser.id } });
      return NextResponse.json(membership);
    }

    // 2. If it's a Quick Member (Name-only logic)
    if (name) {
      // Create a "Shadow User" for this group
      // We generate a unique internal email to satisfy the @unique constraint
      const shadowUser = await prisma.user.create({
        data: {
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}@internal`,
          password: "SHADOW_USER", // Cannot log in
          avatarColor: `#${Math.floor(Math.random()*16777215).toString(16)}`
        }
      });

      const membership = await prisma.groupMember.create({
        data: { groupId: id, userId: shadowUser.id }
      });

      return NextResponse.json(membership);
    }

    return NextResponse.json({ error: "Name or Email required" }, { status: 400 });
  } catch (error) {
    console.error("Add member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
