import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Deprecated. Use /api/v2/payments/create/ on backend.' },
    { status: 410 }
  );
}
