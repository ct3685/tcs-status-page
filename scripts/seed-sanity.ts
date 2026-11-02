/**
 * Seed Sanity with categories + services migrated from the legacy controller.
 * Usage: pnpm seed   (requires a write-capable SANITY token in .env)
 *
 * Idempotent: uses deterministic _ids + createOrReplace. Logos are uploaded
 * best-effort from /public/images.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from 'next-sanity';
import { SEED_SERVICES } from '../src/lib/status/config';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01';
const token = process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_READ_TOKEN;

if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is required');
if (!token) throw new Error('A SANITY token (write access) is required in .env');

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const categoryId = (slug: string) => `category.${slug}`;
const serviceId = (slug: string) => `service.${slug}`;

async function uploadLogo(logoPath: string | undefined): Promise<string | null> {
  if (!logoPath) return null;
  try {
    const file = join(process.cwd(), 'public', logoPath.replace(/^\//, ''));
    const buffer = await readFile(file);
    const asset = await client.assets.upload('image', buffer, {
      filename: logoPath.split('/').pop(),
    });
    return asset._id;
  } catch (err) {
    console.warn(`  ! logo skipped (${logoPath}): ${err instanceof Error ? err.message : 'error'}`);
    return null;
  }
}

async function main() {
  console.log(`Seeding ${SEED_SERVICES.length} services into ${projectId}/${dataset}...`);

  // Unique categories.
  const categories = new Map<string, { name: string; slug: string }>();
  for (const s of SEED_SERVICES) if (s.category) categories.set(s.category.slug, s.category);

  let order = 1;
  for (const cat of categories.values()) {
    await client.createOrReplace({
      _id: categoryId(cat.slug),
      _type: 'statusCategory',
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug },
      order: order++,
      pinned: false,
    });
    console.log(`  category: ${cat.name}`);
  }

  for (const s of SEED_SERVICES) {
    const logoAssetId = await uploadLogo(s.logo);
    await client.createOrReplace({
      _id: serviceId(s.slug),
      _type: 'statusService',
      name: s.name,
      slug: { _type: 'slug', current: s.slug },
      ...(s.category ? { category: { _type: 'reference', _ref: categoryId(s.category.slug) } } : {}),
      ...(logoAssetId
        ? { logo: { _type: 'image', asset: { _type: 'reference', _ref: logoAssetId } } }
        : {}),
      externalStatusPageUrl: s.externalStatusPageUrl,
      feedUrl: s.feedUrl,
      feedType: s.feedType,
      enabled: s.enabled,
      hidden: s.hidden,
      pinned: s.pinned,
      criticality: s.criticality,
      order: s.order,
      tags: s.tags,
      ignoreTitlePatterns: s.ignoreTitlePatterns,
      maintenanceKeywords: s.maintenanceKeywords,
      incidentKeywords: s.incidentKeywords,
      noIncidentPatterns: s.noIncidentPatterns,
    });
    console.log(`  service: ${s.name}${logoAssetId ? ' (logo)' : ''}`);
  }

  // Singleton settings document.
  await client.createIfNotExists({
    _id: 'statusPageSettings',
    _type: 'statusPageSettings',
    title: 'TCS Repair Services Status',
    indexable: true,
    displayMode: 'grid',
  });

  console.log('Done.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
