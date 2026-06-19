import { describe, expect, it } from 'vitest';
import { HerokuParseError, parseHerokuIncidents } from './heroku';

describe('parseHerokuIncidents', () => {
  it('parses a bare incident array with updates', () => {
    const json = JSON.stringify([
      {
        id: 123,
        title: 'Elevated errors on API',
        created_at: '2025-12-01T10:00:00Z',
        updated_at: '2025-12-01T11:00:00Z',
        status: 'resolved',
        full_url: 'https://status.heroku.com/incidents/123',
        updates: [{ update_type: 'resolved', contents: 'All good', created_at: '2025-12-01T11:00:00Z' }],
      },
    ]);
    const items = parseHerokuIncidents(json);
    expect(items).toHaveLength(1);
    expect(items[0]?.sourceId).toBe('123');
    expect(items[0]?.title).toBe('Elevated errors on API');
    expect(items[0]?.contentHtml).toContain('All good');
  });

  it('parses an { incidents: [] } envelope', () => {
    const json = JSON.stringify({ incidents: [{ id: 'x', title: 'T', created_at: '2025-12-01T10:00:00Z' }] });
    expect(parseHerokuIncidents(json)).toHaveLength(1);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseHerokuIncidents('not json')).toThrow(HerokuParseError);
  });

  it('throws on unexpected shape', () => {
    expect(() => parseHerokuIncidents(JSON.stringify({ foo: 'bar' }))).toThrow(HerokuParseError);
  });
});
