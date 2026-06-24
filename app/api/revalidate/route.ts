import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { serverEnv } from '@/lib/env';
import { refreshStatusSnapshot } from '@/lib/status/cache';

/** Constant-time string comparison that avoids leaking match length via timing. */
function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch; compare against expected length
  // to keep the comparison itself constant-time for equal-length inputs.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Secret-protected revalidation endpoint. Wired to a Sanity webhook so content
 * edits (services, settings, manual incidents) refresh the public page.
 *
 * The secret is accepted only via the `x-revalidate-secret` header (never a
 * query string, which can be captured in proxy/access logs).
 */
export async function POST(request: Request) {
  const secret = serverEnv().SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'Revalidation not configured' }, { status: 503 });
  }

  const provided = request.headers.get('x-revalidate-secret') ?? '';
  if (!secretsMatch(provided, secret)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Refresh the cached snapshot so Sanity edits (services, settings, manual
  // incidents) reflect immediately rather than waiting for the next schedule.
  try {
    await refreshStatusSnapshot('on-demand');
    revalidatePath('/');
    revalidatePath('/api/status');
    return NextResponse.json({ ok: true, revalidated: true, now: Date.now() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error(`[api/revalidate] refresh failed: ${message}`);
    return NextResponse.json({ ok: false, error: 'Revalidation failed' }, { status: 500 });
  }
}
