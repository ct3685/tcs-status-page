import { NextResponse } from 'next/server';
import { getStatusSnapshot, snapshotAgeSeconds } from '@/lib/status/cache';

// Computed at request time (reads the Blob snapshot; never prerendered at build).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await getStatusSnapshot();
    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=240',
        'X-Robots-Tag': 'noindex',
        // Lightweight health signal for monitoring without parsing the body.
        'X-Snapshot-Generated-At': snapshot.generatedAt,
        'X-Snapshot-Age-Seconds': String(snapshotAgeSeconds(snapshot)),
        'X-Snapshot-Stale': String(snapshot.stale),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error(`[api/status] failed: ${message}`);
    return NextResponse.json(
      { error: 'Status temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
