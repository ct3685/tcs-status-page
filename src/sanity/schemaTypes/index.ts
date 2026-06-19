import type { SchemaTypeDefinition } from 'sanity';
import { statusCategory } from './statusCategory';
import { statusService } from './statusService';
import { manualIncident } from './manualIncident';
import { statusPageSettings } from './statusPageSettings';

export const schemaTypes: SchemaTypeDefinition[] = [
  statusPageSettings,
  statusCategory,
  statusService,
  manualIncident,
];
