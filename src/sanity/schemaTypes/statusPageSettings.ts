import { defineField, defineType } from 'sanity';

export const statusPageSettings = defineType({
  name: 'statusPageSettings',
  title: 'Status Page Settings',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2 }),
    defineField({ name: 'ogImage', title: 'Open Graph image', type: 'image' }),
    defineField({ name: 'supportCtaLabel', title: 'Support CTA label', type: 'string' }),
    defineField({
      name: 'supportCtaUrl',
      title: 'Support CTA URL',
      type: 'url',
      validation: (r) => r.uri({ scheme: ['https', 'mailto'] }),
    }),
    defineField({ name: 'refreshIntervalCopy', title: 'Refresh interval copy', type: 'string' }),
    defineField({
      name: 'announcement',
      title: 'Global announcement / banner',
      type: 'object',
      fields: [
        { name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false },
        { name: 'message', title: 'Message', type: 'text', rows: 2 },
        {
          name: 'tone',
          title: 'Tone',
          type: 'string',
          options: { list: ['info', 'warning', 'critical'] },
          initialValue: 'info',
        },
      ],
    }),
    defineField({
      name: 'indexable',
      title: 'Allow search engines to index this page',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'displayMode',
      title: 'Display mode',
      type: 'string',
      options: { list: ['grid', 'compact'] },
      initialValue: 'grid',
    }),
  ],
  preview: { prepare: () => ({ title: 'Status Page Settings' }) },
});
