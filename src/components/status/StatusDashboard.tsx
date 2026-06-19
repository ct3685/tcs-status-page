'use client';

import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import StatusSummary, { type ToneFilter } from './StatusSummary';
import StatusFilters from './StatusFilters';
import ServiceGrid from './ServiceGrid';
import MaintenancePanel from './MaintenancePanel';
import type { StatusSnapshot } from '@/lib/status/types';

export default function StatusDashboard({ snapshot }: { snapshot: StatusSnapshot }) {
  const [tone, setTone] = useState<ToneFilter>('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of snapshot.services) if (s.category) set.add(s.category.name);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [snapshot.services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return snapshot.services.filter((s) => {
      if (tone !== 'all' && s.statusTone !== tone) return false;
      if (category !== 'all' && s.category?.name !== category) return false;
      if (
        q &&
        !`${s.name} ${s.category?.name ?? ''} ${s.description ?? ''}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [snapshot.services, tone, category, query]);

  return (
    <Stack spacing={3}>
      <StatusSummary summary={snapshot.summary} active={tone} onSelect={setTone} />
      <MaintenancePanel services={snapshot.services} />
      <StatusFilters
        query={query}
        onQueryChange={setQuery}
        category={category}
        categories={categories}
        onCategoryChange={setCategory}
      />
      <ServiceGrid services={filtered} />
    </Stack>
  );
}
