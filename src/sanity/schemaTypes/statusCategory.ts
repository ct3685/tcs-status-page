import { defineField, defineType } from 'sanity';

export const statusCategory = defineType({
  name: 'statusCategory',
  title: 'Service Category',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
    defineField({ name: 'icon', title: 'Icon (emoji or short label)', type: 'string' }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      initialValue: 100,
    }),
    defineField({
      name: 'pinned',
      title: 'Pinned / featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'slug.current' },
  },
});
