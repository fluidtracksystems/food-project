import { PILLARS, type Pillar } from './pillar-list';

/**
 * Provider-agnostic analytics. Pages call `track()`, which dispatches one DOM event. A provider
 * (undecided, see docs/specs/05-growth-plumbing.md) later listens for it:
 *
 *   window.addEventListener('site:analytics', (e) => provider.send(e.detail.name, e.detail.params));
 *
 * No cookies, no network calls and no vendor code live here. Params are short strings from a fixed
 * list per event, and anything that looks like an email address is refused so a typed address can
 * never reach a provider.
 */
export const ANALYTICS_EVENT = 'site:analytics';

export const OUTBOUND_DESTINATIONS = ['pinterest', 'instagram'] as const;
export type OutboundDestination = (typeof OUTBOUND_DESTINATIONS)[number];

export interface EventParamMap {
  calculator_used: { tool: string };
  email_signup: { page: string; form: string };
  recipe_viewed: { slug: string; pillar: Pillar };
  outbound_click: { destination: OutboundDestination; page: string };
}

export type EventName = keyof EventParamMap;

export interface AnalyticsEvent<N extends EventName = EventName> {
  name: N;
  params: EventParamMap[N];
}

export type BuildResult<N extends EventName> = { ok: true; event: AnalyticsEvent<N> } | { ok: false; error: string };

const KEYS: Record<EventName, readonly string[]> = {
  calculator_used: ['tool'],
  email_signup: ['form', 'page'],
  recipe_viewed: ['pillar', 'slug'],
  outbound_click: ['destination', 'page'],
};

const MAX_LENGTH = 100;

function fail<N extends EventName>(error: string): BuildResult<N> {
  return { ok: false, error };
}

/** Validates and normalises an event. Pure: never throws and never touches the DOM. */
export function buildEvent<N extends EventName>(name: N, params: EventParamMap[N]): BuildResult<N> {
  if (!Object.hasOwn(KEYS, name)) return fail(`Unknown event "${String(name)}".`);
  if (typeof params !== 'object' || params === null) return fail('Params must be an object.');

  const raw = params as Record<string, unknown>;
  const expected = [...KEYS[name]].sort();
  const given = Object.keys(raw).sort();
  if (expected.join() !== given.join()) return fail(`${name} takes exactly: ${expected.join(', ')}.`);

  const clean: Record<string, string> = {};
  for (const key of expected) {
    const value = raw[key];
    if (typeof value !== 'string') return fail(`${key} must be a string.`);
    const trimmed = value.trim();
    if (trimmed === '' || trimmed.length > MAX_LENGTH) return fail(`${key} must be 1 to ${MAX_LENGTH} characters.`);
    if (trimmed.includes('@')) return fail(`${key} must not contain an email address.`);
    clean[key] = trimmed;
  }

  if ('pillar' in clean && !(PILLARS as readonly string[]).includes(clean.pillar as string)) {
    return fail('pillar is not a content pillar.');
  }
  if ('page' in clean && !(clean.page as string).startsWith('/')) return fail('page must be a site path.');
  if ('page' in clean && (clean.page as string).startsWith('//')) return fail('page must be a site path.');
  if ('destination' in clean && !(OUTBOUND_DESTINATIONS as readonly string[]).includes(clean.destination as string)) {
    return fail('destination is not a known outbound destination.');
  }

  return { ok: true, event: { name, params: clean as unknown as EventParamMap[N] } };
}

/** Sends an event to whatever is listening. Returns whether it was sent; never throws. */
export function track<N extends EventName>(name: N, params: EventParamMap[N]): boolean {
  const built = buildEvent(name, params);
  if (!built.ok || typeof window === 'undefined') return false;
  try {
    window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT, { detail: built.event }));
    return true;
  } catch {
    return false;
  }
}
