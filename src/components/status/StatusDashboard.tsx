'use client';

import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import StatusSummary, { type ToneFilter } from './StatusSummary';
import StatusFilters from './StatusFilters';
import ServiceGrid from './ServiceGrid';
import MaintenancePanel from './MaintenancePanel';
import type { ServiceStatus, StatusSummary as StatusSummaryData } from '@/lib/status/types';

// Receives only the filterable data, not the full snapshot, so this client
// island stays decoupled from snapshot metadata (generatedAt, source, etc.).
export default function StatusDashboard({
  services,
  summary,
}: {
  services: ServiceStatus[];
  summary: StatusSummaryData;
}) {
  const [tone, setTone] = useState<ToneFilter>('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) if (s.category) set.add(s.category.name);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
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
  }, [services, tone, category, query]);

  return (
    <Stack spacing={3}>
      <StatusSummary summary={summary} active={tone} onSelect={setTone} />
      <MaintenancePanel services={services} />
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
