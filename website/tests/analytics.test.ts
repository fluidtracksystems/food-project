import { afterEach, describe, expect, it, vi } from 'vitest';
import { ANALYTICS_EVENT, buildEvent, track } from '../src/lib/analytics';

describe('buildEvent', () => {
  it('builds a calculator_used event', () => {
    expect(buildEvent('calculator_used', { tool: 'recipe-cost-calculator' })).toEqual({
      ok: true,
      event: { name: 'calculator_used', params: { tool: 'recipe-cost-calculator' } },
    });
  });

  it('builds the other three events from the spec', () => {
    expect(buildEvent('email_signup', { page: '/', form: 'signup' }).ok).toBe(true);
    expect(buildEvent('recipe_viewed', { slug: 'egg-fried-rice', pillar: 'leftovers' }).ok).toBe(true);
    expect(buildEvent('outbound_click', { destination: 'pinterest', page: '/low-energy/' }).ok).toBe(true);
  });

  it('trims string values', () => {
    const r = buildEvent('calculator_used', { tool: '  fiber-calculator ' });
    expect(r.ok && r.event.params).toEqual({ tool: 'fiber-calculator' });
  });

  it('rejects an empty or whitespace value', () => {
    expect(buildEvent('calculator_used', { tool: '' }).ok).toBe(false);
    expect(buildEvent('calculator_used', { tool: '   ' }).ok).toBe(false);
  });

  it('rejects a non-string value', () => {
    expect(buildEvent('calculator_used', { tool: 5 as unknown as string }).ok).toBe(false);
    expect(buildEvent('calculator_used', { tool: null as unknown as string }).ok).toBe(false);
  });

  it('rejects a value over 100 characters', () => {
    expect(buildEvent('calculator_used', { tool: 'a'.repeat(101) }).ok).toBe(false);
    expect(buildEvent('calculator_used', { tool: 'a'.repeat(100) }).ok).toBe(true);
  });

  it('refuses anything that looks like an email address, so a typed address cannot leak', () => {
    expect(buildEvent('email_signup', { page: '/', form: 'jo@example.com' }).ok).toBe(false);
    expect(buildEvent('calculator_used', { tool: 'a@b' }).ok).toBe(false);
  });

  it('rejects unknown or missing keys', () => {
    expect(buildEvent('calculator_used', { tool: 'x', email: 'y' } as never).ok).toBe(false);
    expect(buildEvent('email_signup', { page: '/' } as never).ok).toBe(false);
    expect(buildEvent('calculator_used', {} as never).ok).toBe(false);
  });

  it('rejects an unknown event name', () => {
    expect(buildEvent('page_scrolled' as never, {} as never).ok).toBe(false);
  });

  it('requires a pillar from the content model', () => {
    expect(buildEvent('recipe_viewed', { slug: 'x', pillar: 'desserts' as never }).ok).toBe(false);
  });

  it('requires a page to be a site path', () => {
    expect(buildEvent('email_signup', { page: 'https://evil.example/', form: 'signup' }).ok).toBe(false);
    expect(buildEvent('email_signup', { page: 'no-slash', form: 'signup' }).ok).toBe(false);
    expect(buildEvent('email_signup', { page: '/ok/', form: 'signup' }).ok).toBe(true);
  });

  it('only allows known outbound destinations', () => {
    expect(buildEvent('outbound_click', { destination: 'facebook' as never, page: '/' }).ok).toBe(false);
    expect(buildEvent('outbound_click', { destination: 'instagram', page: '/' }).ok).toBe(true);
  });

  it('does not mutate the params it is given', () => {
    const params = { tool: '  x ' };
    buildEvent('calculator_used', params);
    expect(params.tool).toBe('  x ');
  });
});

describe('track', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing and does not throw when there is no window (server or build)', () => {
    expect(track('calculator_used', { tool: 'x' })).toBe(false);
  });

  it('dispatches one provider-agnostic CustomEvent carrying the event', () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    expect(track('calculator_used', { tool: 'recipe-cost-calculator' })).toBe(true);
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    const sent = dispatchEvent.mock.calls[0]?.[0] as CustomEvent;
    expect(sent.type).toBe(ANALYTICS_EVENT);
    expect(sent.detail).toEqual({ name: 'calculator_used', params: { tool: 'recipe-cost-calculator' } });
  });

  it('does not dispatch an invalid event', () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    expect(track('calculator_used', { tool: 'a@b.c' })).toBe(false);
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('swallows a listener error instead of breaking the page', () => {
    vi.stubGlobal('window', {
      dispatchEvent: () => {
        throw new Error('listener failed');
      },
    });
    expect(() => track('calculator_used', { tool: 'x' })).not.toThrow();
    expect(track('calculator_used', { tool: 'x' })).toBe(false);
  });
});
