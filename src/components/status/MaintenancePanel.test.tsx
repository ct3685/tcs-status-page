import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import MaintenancePanel from './MaintenancePanel';
import type { Incident, ServiceStatus } from '@/lib/status/types';

function service(incident: Pick<Incident, 'id' | 'title' | 'isCurrentMaintenance'>): ServiceStatus {
  const maintenance: Incident = {
    id: incident.id,
    sourceId: incident.id,
    title: incident.title,
    summary: '',
    contentHtmlSanitized: '',
    url: null,
    publishedAt: '2026-11-04T16:00:00.000Z',
    updatedAt: null,
    startedAt: '2026-11-04T16:00:00.000Z',
    resolvedAt: null,
    status: incident.isCurrentMaintenance ? 'inProgress' : 'scheduled',
    severity: 'maintenance',
    type: 'maintenance',
    isActive: incident.isCurrentMaintenance,
    isResolved: false,
    isRecent: false,
    isVeryRecent: false,
    isFutureMaintenance: !incident.isCurrentMaintenance,
    isCurrentMaintenance: incident.isCurrentMaintenance,
    updates: [],
  };

  return {
    id: 'cloudflare',
    slug: 'cloudflare',
    name: 'Cloudflare',
    description: null,
    category: null,
    logo: null,
    externalStatusPageUrl: null,
    currentStatus: incident.isCurrentMaintenance ? 'maintenance' : 'operational',
    statusLabel: incident.isCurrentMaintenance ? 'Under maintenance' : 'Operational',
    statusTone: incident.isCurrentMaintenance ? 'maintenance' : 'operational',
    severity: 'maintenance',
    criticality: 'high',
    pinned: false,
    order: 1,
    lastIncidentAt: null,
    lastCheckedAt: '2026-11-04T17:00:00.000Z',
    isFetchError: false,
    fetchErrorMessage: null,
    activeIncidents: [],
    recentIncidents: [],
    scheduledMaintenance: [maintenance],
    pastMaintenance: [],
    rawSourceMeta: { feedType: 'rss', feedUrl: null, itemCount: 1 },
  };
}

function panelButton() {
  return screen.getByRole('button', { name: /Scheduled maintenance/ });
}

function serviceWithWindows(count: number): ServiceStatus {
  const base = service({ id: 'seed', title: 'seed', isCurrentMaintenance: false });
  const template = base.scheduledMaintenance[0];
  if (!template) throw new Error('expected a maintenance window');
  base.scheduledMaintenance = Array.from({ length: count }, (_, index): Incident => {
    const iso = new Date(Date.UTC(2026, 10, 4, 16, index)).toISOString();
    return {
      ...template,
      id: `w${index}`,
      sourceId: `w${index}`,
      title: `Window ${index + 1}`,
      startedAt: iso,
      publishedAt: iso,
    };
  });
  return base;
}

describe('MaintenancePanel', () => {
  it('starts collapsed for upcoming windows', () => {
    render(
      <MaintenancePanel
        services={[service({ id: 'm1', title: 'Osaka maintenance', isCurrentMaintenance: false })]}
      />,
    );

    expect(panelButton()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Osaka maintenance')).not.toBeInTheDocument();
  });

  it('starts collapsed when a window is already in progress', () => {
    render(
      <MaintenancePanel
        services={[service({ id: 'm2', title: 'Live window', isCurrentMaintenance: true })]}
      />,
    );

    expect(panelButton()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Live window')).not.toBeInTheDocument();
  });

  it('opens the list when the header is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MaintenancePanel
        services={[
          service({ id: 'm3', title: 'Amsterdam maintenance', isCurrentMaintenance: false }),
        ]}
      />,
    );

    await user.click(panelButton());

    expect(panelButton()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Amsterdam maintenance')).toBeVisible();
  });

  it('reveals the rest of the list from the more-windows control', async () => {
    const user = userEvent.setup();
    render(<MaintenancePanel services={[serviceWithWindows(10)]} />);

    await user.click(panelButton());

    expect(screen.getByText('Window 1')).toBeVisible();
    expect(screen.getByText('Window 8')).toBeVisible();
    expect(screen.queryByText('Window 9')).not.toBeInTheDocument();
    expect(screen.queryByText('Window 10')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '+2 more maintenance windows' }));

    expect(screen.getByText('Window 9')).toBeVisible();
    expect(screen.getByText('Window 10')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Show fewer' }));

    expect(screen.queryByText('Window 9')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+2 more maintenance windows' })).toBeVisible();
  });
});
