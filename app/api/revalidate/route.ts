import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { serverEnv } from '@/lib/env';
import { refreshStatusSnapshot } from '@/lib/status/cache';

/**
 * Secret-protected revalidation endpoint. Wired to a Sanity webhook so content
 * edits (services, settings, manual incidents) refresh the public page.
 */
export async function POST(request: Request) {
  const secret = serverEnv().SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'Revalidation not configured' }, { status: 503 });
  }

  const provided =
    request.headers.get('x-revalidate-secret') ?? new URL(request.url).searchParams.get('secret');

  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Refresh the cached snapshot so Sanity edits (services, settings, manual
  // incidents) reflect immediately rather than waiting for the next schedule.
  await refreshStatusSnapshot('on-demand');
  revalidatePath('/');
  revalidatePath('/api/status');
  return NextResponse.json({ ok: true, revalidated: true, now: Date.now() });
}
