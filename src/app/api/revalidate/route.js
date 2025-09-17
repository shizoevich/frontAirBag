import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request) {
  try {
    const { tag, secret } = await request.json();

    // Simple auth using env secret
    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!tag || typeof tag !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing tag' }, { status: 400 });
    }

    revalidateTag(tag);
    return NextResponse.json({ ok: true, revalidated: tag });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 });
  }
}
