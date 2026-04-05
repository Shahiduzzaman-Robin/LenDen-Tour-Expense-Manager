/**
 * Simplify Debts Algorithm
 * Uses a greedy approach to minimize the number of transactions.
 * 
 * 1. Calculate net balance for each person
 * 2. Separate into creditors (positive balance) and debtors (negative balance)
 * 3. Match the largest debtor with the largest creditor
 * 4. Settle the minimum of the two amounts
 * 5. Repeat until all balances are zero
 */

export interface DebtEdge {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface BalanceMap {
  [userId: string]: {
    name: string;
    balance: number;
  };
}

export interface BorrowingEdge {
  fromId: string;
  toId: string;
  amount: number;
}

export function applyBorrowingsToBalances(balances: BalanceMap, borrowings: BorrowingEdge[]): void {
  for (const borrowing of borrowings) {
    if (borrowing.amount <= 0) continue;

    const fromBalance = balances[borrowing.fromId];
    const toBalance = balances[borrowing.toId];
    if (!fromBalance || !toBalance) continue;

    // `fromId` borrowed from `toId`, so from owes and to is owed.
    fromBalance.balance -= borrowing.amount;
    toBalance.balance += borrowing.amount;
  }
}

export function simplifyDebts(balances: BalanceMap): DebtEdge[] {
  const transactions: DebtEdge[] = [];

  // Separate into creditors and debtors
  const creditors: { id: string; name: string; amount: number }[] = [];
  const debtors: { id: string; name: string; amount: number }[] = [];

  for (const [userId, data] of Object.entries(balances)) {
    if (data.balance > 0.01) {
      creditors.push({ id: userId, name: data.name, amount: data.balance });
    } else if (data.balance < -0.01) {
      debtors.push({ id: userId, name: data.name, amount: -data.balance });
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const settleAmount = Math.min(creditors[i].amount, debtors[j].amount);

    if (settleAmount > 0.01) {
      transactions.push({
        from: debtors[j].id,
        fromName: debtors[j].name,
        to: creditors[i].id,
        toName: creditors[i].name,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    creditors[i].amount -= settleAmount;
    debtors[j].amount -= settleAmount;

    if (creditors[i].amount < 0.01) i++;
    if (debtors[j].amount < 0.01) j++;
  }

  return transactions;
}
