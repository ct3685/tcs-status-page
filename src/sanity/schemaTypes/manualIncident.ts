import { defineField, defineType } from 'sanity';

const STATUSES = [
  { title: 'Investigating', value: 'investigating' },
  { title: 'Identified', value: 'identified' },
  { title: 'Monitoring', value: 'monitoring' },
  { title: 'Resolved', value: 'resolved' },
  { title: 'Scheduled', value: 'scheduled' },
  { title: 'In progress', value: 'inProgress' },
  { title: 'Completed', value: 'completed' },
];

const SEVERITIES = [
  { title: 'Operational', value: 'operational' },
  { title: 'Degraded', value: 'degraded' },
  { title: 'Partial outage', value: 'partialOutage' },
  { title: 'Major outage', value: 'majorOutage' },
  { title: 'Maintenance', value: 'maintenance' },
  { title: 'Unknown', value: 'unknown' },
];

export const manualIncident = defineType({
  name: 'manualIncident',
  title: 'Manual Incident / Maintenance',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'affectedServices',
      title: 'Affected services',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'statusService' }] }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: STATUSES },
      initialValue: 'investigating',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'severity',
      title: 'Severity',
      type: 'string',
      options: { list: SEVERITIES },
      initialValue: 'degraded',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'startTime', title: 'Start time', type: 'datetime' }),
    defineField({ name: 'endTime', title: 'End time', type: 'datetime' }),
    defineField({ name: 'scheduledStart', title: 'Scheduled start', type: 'datetime' }),
    defineField({ name: 'scheduledEnd', title: 'Scheduled end', type: 'datetime' }),
    defineField({ name: 'body', title: 'Update content', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'externalLink',
      title: 'External link',
      type: 'url',
      validation: (r) => r.uri({ scheme: ['https'] }),
    }),
    defineField({ name: 'published', title: 'Published', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'status' },
  },
});
