import { defineField, defineType } from 'sanity';

const FEED_TYPES = [
  { title: 'RSS / Atom', value: 'rss' },
  { title: 'Atlassian Statuspage RSS', value: 'atlassianStatuspageRss' },
  { title: 'Heroku API', value: 'herokuApi' },
  { title: 'Statuspage RSS', value: 'statuspageRss' },
  { title: 'Custom JSON', value: 'customJson' },
  { title: 'Manual only (no feed)', value: 'manualOnly' },
];

const CRITICALITIES = [
  { title: 'Critical', value: 'critical' },
  { title: 'High', value: 'high' },
  { title: 'Normal', value: 'normal' },
  { title: 'Low', value: 'low' },
];

const STATUS_LEVELS = [
  { title: 'Operational', value: 'operational' },
  { title: 'Degraded', value: 'degraded' },
  { title: 'Partial outage', value: 'partialOutage' },
  { title: 'Major outage', value: 'majorOutage' },
  { title: 'Maintenance', value: 'maintenance' },
  { title: 'Unknown', value: 'unknown' },
];

export const statusService = defineType({
  name: 'statusService',
  title: 'Service',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'feed', title: 'Feed & parsing' },
    { name: 'override', title: 'Manual override' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'main',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'main',
      options: { source: 'name', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'shortDescription', title: 'Short description', type: 'text', rows: 2, group: 'main' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'statusCategory' }],
      group: 'main',
    }),
    defineField({ name: 'logo', title: 'Logo', type: 'image', options: { hotspot: true }, group: 'main' }),
    defineField({
      name: 'externalStatusPageUrl',
      title: 'External status page URL',
      type: 'url',
      group: 'main',
      validation: (r) => r.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'criticality',
      title: 'Criticality',
      type: 'string',
      group: 'main',
      options: { list: CRITICALITIES, layout: 'radio' },
      initialValue: 'normal',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', group: 'main', initialValue: 100 }),
    defineField({ name: 'enabled', title: 'Enabled (fetched + shown)', type: 'boolean', group: 'main', initialValue: true }),
    defineField({ name: 'hidden', title: 'Hidden from UI', type: 'boolean', group: 'main', initialValue: false }),
    defineField({ name: 'pinned', title: 'Pinned to top', type: 'boolean', group: 'main', initialValue: false }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], group: 'main', options: { layout: 'tags' } }),
    defineField({ name: 'owner', title: 'Owner / team', type: 'string', group: 'main' }),

    defineField({
      name: 'feedType',
      title: 'Feed type',
      type: 'string',
      group: 'feed',
      options: { list: FEED_TYPES },
      initialValue: 'atlassianStatuspageRss',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'feedUrl',
      title: 'Feed URL (HTTPS)',
      type: 'url',
      group: 'feed',
      validation: (r) =>
        r.uri({ scheme: ['https'] }).custom((value, context) => {
          const feedType = (context.document?.feedType as string) ?? '';
          if (feedType !== 'manualOnly' && !value) return 'Feed URL is required unless feed type is "Manual only"';
          return true;
        }),
    }),
    defineField({ name: 'timeoutMs', title: 'Timeout override (ms)', type: 'number', group: 'feed' }),
    defineField({ name: 'ignoreTitlePatterns', title: 'Ignore title patterns', type: 'array', of: [{ type: 'string' }], group: 'feed' }),
    defineField({ name: 'maintenanceKeywords', title: 'Maintenance keywords', type: 'array', of: [{ type: 'string' }], group: 'feed' }),
    defineField({ name: 'incidentKeywords', title: 'Incident keywords', type: 'array', of: [{ type: 'string' }], group: 'feed' }),
    defineField({ name: 'noIncidentPatterns', title: 'No-incident / informational patterns', type: 'array', of: [{ type: 'string' }], group: 'feed' }),
    defineField({
      name: 'fallbackStatus',
      title: 'Fallback status (when feed fails)',
      type: 'string',
      group: 'feed',
      options: { list: STATUS_LEVELS },
    }),

    defineField({
      name: 'manualStatusOverride',
      title: 'Manual status override',
      type: 'string',
      group: 'override',
      options: { list: STATUS_LEVELS },
      description: 'Forces the displayed status until the expiry below. Requires an expiry.',
    }),
    defineField({
      name: 'manualOverrideExpiry',
      title: 'Override expiry',
      type: 'datetime',
      group: 'override',
      validation: (r) =>
        r.custom((value, context) => {
          const override = context.document?.manualStatusOverride;
          if (override && !value) return 'An expiry is required when a manual override is set';
          return true;
        }),
    }),
    defineField({ name: 'editorNotes', title: 'Notes for editors', type: 'text', rows: 2, group: 'override' }),
  ],
  orderings: [{ title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'category.name', media: 'logo' },
  },
});
