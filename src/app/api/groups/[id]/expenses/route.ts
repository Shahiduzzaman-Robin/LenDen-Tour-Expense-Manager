import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const expenses = await prisma.expense.findMany({
      where: { groupId: id },
      include: {
        paidBy: { select: { id: true, name: true, avatarColor: true } },
        splits: { include: { user: { select: { id: true, name: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, amount, splitType, splits, paidById } = await request.json();

    if (!title || !amount) {
      return NextResponse.json({ error: "Title and amount are required" }, { status: 400 });
    }

    // splits: [{ userId: string, amount: number, percentage: number }]
    const expense = await prisma.expense.create({
      data: {
        title,
        description,
        amount: parseFloat(amount),
        splitType: splitType || "equal",
        paidById: paidById || user.userId,
        groupId: id,
        splits: {
          create: splits.map((s: any) => ({
            userId: s.userId,
            amount: parseFloat(s.amount)
          }))
        }
      },
      include: {
        splits: true
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get("expenseId");

    if (!expenseId) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { group: { select: { id: true } } }
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    if (expense.group.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.expense.delete({
      where: { id: expenseId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
