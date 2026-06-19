import { NextResponse } from 'next/server';
import { getStatusSnapshot } from '@/lib/status/cache';

// Computed at request time (reads the Blob snapshot; never prerendered at build).
export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await getStatusSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=240',
      'X-Robots-Tag': 'noindex',
    },
  });
}
