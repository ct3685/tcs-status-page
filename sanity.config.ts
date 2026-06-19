'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';
import { publicEnv } from './src/lib/env';

export default defineConfig({
  name: 'lr-status-page',
  title: 'LR Status Page',
  basePath: '/studio',
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
