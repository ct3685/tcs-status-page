/**
 * Disable (or re-enable) a status service in Sanity without deleting it.
 * Usage:
 *   pnpm secure-run tsx scripts/disable-service.ts <slug> [--enable]
 *
 * Disabling sets `enabled: false`, which removes the service from the public
 * snapshot (buildSnapshot filters out disabled services) while preserving the
 * document so it can be toggled back on. Requires a write-capable Sanity token.
 */
import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01';
const token = process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_READ_TOKEN;

const slug = process.argv[2];
const enable = process.argv.includes('--enable');

if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is required');
if (!token) throw new Error('A SANITY token with write access is required');
if (!slug) throw new Error('Usage: tsx scripts/disable-service.ts <slug> [--enable]');

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

async function main() {
  const id = `service.${slug}`;
  const existing = await client.fetch<{ _id: string; name: string; enabled?: boolean } | null>(
    `*[_id == $id][0]{ _id, name, enabled }`,
    { id },
  );
  if (!existing) {
    console.log(`No service document found for _id=${id}; nothing to do.`);
    return;
  }
  const res = await client.patch(id).set({ enabled: enable }).commit<{ enabled?: boolean }>();
  console.log(
    `${enable ? 'Enabled' : 'Disabled'} "${existing.name}" (${id}) in ${projectId}/${dataset}; enabled is now ${res.enabled}`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
