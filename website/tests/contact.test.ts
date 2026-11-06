import { describe, expect, it, vi } from 'vitest';
import { encodeContact, parseChallengeCookie, contactOutcome, sendContact } from '../src/lib/contact';

const json = (status: number, data: unknown) => new Response(JSON.stringify(data), { status });
const challenge = (name = 'humans_changed') => new Response(`<script>document.cookie = "${name}=1"; document.location.reload(true)</script>`, { status: 409 });
const formData = () => {
  const data = new FormData();
  data.set('name', 'Jo & Lee');
  data.set('email', 'jo+food@example.com');
  data.set('message', 'Hello = world\nSecond line ☕');
  data.set('hp_check', '');
  return data;
};

describe('contact encoding', () => {
  it('encodes exactly the four form fields, preserving special characters and line breaks', () => {
    const data = formData();
    data.set('recipient', 'other@example.com');
    const body = encodeContact(data);
    expect([...body.keys()]).toEqual(['name', 'email', 'message', 'hp_check']);
    expect(body.get('hp_check')).toBe('');
    expect(body.get('message')).toBe('Hello = world\nSecond line ☕');
    expect(body.toString()).toContain('email=jo%2Bfood%40example.com');
    expect(body.toString()).toContain('name=Jo+%26+Lee');
  });
  it('always includes the honeypot and preserves filled spam values', () => {
    const data = formData();
    data.delete('hp_check');
    expect(encodeContact(data).get('hp_check')).toBe('');
    data.set('hp_check', 'bot');
    expect(encodeContact(data).get('hp_check')).toBe('bot');
  });
});

describe('contact response mapping', () => {
  it('requires exactly status 200 and boolean ok true for success', () => {
    expect(contactOutcome(200, { ok: true })).toEqual({ kind: 'sent' });
    for (const [status, body] of [[201, { ok: true }], [200, { ok: 'true' }], [200, null], [200, {}], [500, { ok: true }]] as const) {
      expect(contactOutcome(status, body)).toEqual({ kind: 'failed' });
    }
  });
  it('filters validation fields and uses local wording', () => {
    expect(contactOutcome(422, { ok: false, error: 'validation', fields: { name: 'Bad name', email: '<b>wrong</b>', surprise: 'no' } })).toEqual({
      kind: 'invalid', fields: { name: 'Enter your name on one line, using no more than 100 characters.', email: 'Enter a plain email address, using no more than 254 characters.' },
    });
  });
  it('treats malformed validation replies and other statuses as failures', () => {
    for (const body of [null, {}, { fields: null }, { ok: false, error: 'validation', fields: { name: 123 } }, { ok: false, error: 'validation', fields: { unknown: 'bad' } }]) {
      expect(contactOutcome(422, body)).toEqual({ kind: 'failed' });
    }
    for (const status of [403, 405, 413, 415, 409, 500]) expect(contactOutcome(status, { error: 'raw_error' })).toEqual({ kind: 'failed' });
  });
  it('maps only a valid rate-limit reply to the limited state', () => {
    expect(contactOutcome(429, { error: 'rate_limited' })).toEqual({ kind: 'limited' });
    expect(contactOutcome(429, null)).toEqual({ kind: 'failed' });
  });
});

describe('host bot challenge', () => {
  it('extracts a changing cookie name without executing the script', () => {
    expect(parseChallengeCookie('<script>document.cookie = "humans_new=abc"; alert(1)</script>')).toBe('humans_new=abc; path=/');
  });
  it('rejects missing, malformed or control-character cookie assignments', () => {
    for (const text of ['', 'document.cookie = "missing-equals"', 'document.cookie = "bad name=1"', 'document.cookie = "name=x\nmalicious"', 'document.cookie = "name=1; domain=example.com"']) {
      expect(parseChallengeCookie(text)).toBeNull();
    }
  });
  it('retries once with the same relative URL, method, headers and body', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(challenge()).mockResolvedValueOnce(json(200, { ok: true }));
    const setCookie = vi.fn();
    expect(await sendContact(formData(), { fetch: fetcher, setCookie })).toEqual({ kind: 'sent' });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0]).toEqual(fetcher.mock.calls[1]);
    expect(fetcher.mock.calls[0][0]).toBe('/api/contact.php');
    expect(fetcher.mock.calls[0][1]).toEqual({ method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: expect.any(URLSearchParams) });
    expect(setCookie).toHaveBeenCalledExactlyOnceWith('humans_changed=1; path=/');
  });
  it('never retries a repeated challenge or an unrecognized challenge', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(challenge()).mockResolvedValueOnce(challenge('second'));
    const setCookie = vi.fn();
    expect(await sendContact(formData(), { fetch: fetcher, setCookie })).toEqual({ kind: 'failed' });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(setCookie).toHaveBeenCalledTimes(1);
    const missing = vi.fn().mockResolvedValue(new Response('not a challenge', { status: 409 }));
    expect(await sendContact(formData(), { fetch: missing, setCookie })).toEqual({ kind: 'failed' });
    expect(missing).toHaveBeenCalledTimes(1);
  });
  it('handles invalid JSON, initial network errors, and retry network errors', async () => {
    const options = { setCookie: vi.fn() };
    expect(await sendContact(formData(), { ...options, fetch: vi.fn().mockResolvedValue(new Response('<html>oops</html>')) })).toEqual({ kind: 'failed' });
    expect(await sendContact(formData(), { ...options, fetch: vi.fn().mockRejectedValue(new TypeError('offline')) })).toEqual({ kind: 'network' });
    expect(await sendContact(formData(), { ...options, fetch: vi.fn().mockResolvedValueOnce(challenge()).mockRejectedValueOnce(new TypeError('offline')) })).toEqual({ kind: 'network' });
  });
  it('does not retry ordinary server failures', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(500, { error: 'delivery_failed' }));
    expect(await sendContact(formData(), { fetch: fetcher, setCookie: vi.fn() })).toEqual({ kind: 'failed' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
