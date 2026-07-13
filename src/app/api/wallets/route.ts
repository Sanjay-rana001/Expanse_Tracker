import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wallets = await prisma.wallet.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(wallets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, type, balance } = await request.json();

    const wallet = await prisma.wallet.create({
      data: {
        name,
        type,
        balance: parseFloat(balance) || 0,
        userId: session.userId
      }
    });

    return NextResponse.json(wallet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
  }
}
