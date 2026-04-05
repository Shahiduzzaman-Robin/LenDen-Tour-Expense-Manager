import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, fromId, toId } = await request.json();

    const settlement = await prisma.settlement.create({
      data: {
        amount: parseFloat(amount),
        fromId,
        toId,
        groupId: id
      }
    });

    return NextResponse.json(settlement);
  } catch (error) {
    console.error("Settle up error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
