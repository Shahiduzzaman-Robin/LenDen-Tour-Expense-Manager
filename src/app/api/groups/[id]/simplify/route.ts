import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { applyBorrowingsToBalances, simplifyDebts } from "@/lib/simplify-debts";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const user = getUserFromRequest(request.headers);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true } } } },
        expenses: { include: { splits: true } },
        settlements: true,
      }
    });

    const borrowings = await prisma.$queryRaw<Array<{ fromId: string; toId: string; amount: number }>>`
      SELECT fromId, toId, amount
      FROM Borrowing
      WHERE groupId = ${id}
    `;

    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const balances: any = {};
    for (const m of group.members) {
      balances[m.userId] = { name: m.user.name, totalPaid: 0, balance: 0 };
    }
    const splitShareByUser: Record<string, number> = {};
    for (const m of group.members) {
      splitShareByUser[m.userId] = 0;
    }

    // 1. Calculate expense balances
    let totalGroupExpense = 0;
    for (const exp of group.expenses) {
      totalGroupExpense += exp.amount;
      if (balances[exp.paidById]) {
          balances[exp.paidById].totalPaid += exp.amount;
          balances[exp.paidById].balance += exp.amount;
      }
      for (const split of exp.splits) {
          if (balances[split.userId]) balances[split.userId].balance -= split.amount;
          if (splitShareByUser[split.userId] !== undefined) {
            splitShareByUser[split.userId] += split.amount;
          }
      }
    }

    // 2. Adjust for settlements
    for (const set of group.settlements) {
      if (balances[set.fromId]) balances[set.fromId].balance += set.amount;
      if (balances[set.toId]) balances[set.toId].balance -= set.amount;
    }

    // 3. Add direct person-to-person borrowings/rents
    applyBorrowingsToBalances(
      balances,
      borrowings.map((borrowing) => ({
        fromId: borrowing.fromId,
        toId: borrowing.toId,
        amount: borrowing.amount,
      }))
    );

    const simpleDebts = simplifyDebts(balances);
    
    return NextResponse.json({ 
        balances, 
        simplified: simpleDebts, 
        totalExpense: totalGroupExpense,
      perPersonShare: totalGroupExpense / (group.members.length || 1),
      splitShareByUser,
    });
  } catch (error: any) {
    console.error("Simplification Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
