import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.userId },
      include: { wallet: true },
      orderBy: { date: 'desc' },
      take: 50
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, type, category, date, notes, walletId } = await request.json();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create transaction and update wallet balance in a transaction
    const transaction = await prisma.$transaction(async (tx) => {
      const newTx = await tx.transaction.create({
        data: {
          amount: parsedAmount,
          type,
          category,
          date: date ? new Date(date) : new Date(),
          notes,
          walletId,
          userId: session.userId
        }
      });

      // Update wallet balance
      const balanceChange = type === 'EXPENSE' ? -parsedAmount : parsedAmount;
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: balanceChange } }
      });

      return newTx;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
