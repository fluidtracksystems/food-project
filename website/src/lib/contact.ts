export const CONTACT_FIELDS = ['name', 'email', 'message'] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactErrors = Partial<Record<ContactField, string>>;
export type ContactOutcome =
  | { kind: 'sent' }
  | { kind: 'invalid'; fields: ContactErrors }
  | { kind: 'limited' | 'failed' | 'network' };

const fieldMessages: Record<ContactField, string> = {
  name: 'Enter your name on one line, using no more than 100 characters.',
  email: 'Enter a plain email address, using no more than 254 characters.',
  message: 'Enter a message, using no more than 5,000 characters.',
};

/** Whitelist the contract fields. Never remove a filled honeypot before sending. */
export function encodeContact(data: FormData): URLSearchParams {
  const fields = new FormData();
  for (const field of [...CONTACT_FIELDS, 'hp_check']) {
    const value = data.get(field);
    fields.set(field, typeof value === 'string' ? value : '');
  }
  // DOM typings do not accept FormData directly; every value above is a string.
  return new URLSearchParams(Array.from(fields, ([key, value]) => [key, String(value)]));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Only documented response shapes may produce success or validation messages. */
export function contactOutcome(status: number, data: unknown): ContactOutcome {
  if (!isRecord(data)) return { kind: 'failed' };
  if (status === 200 && data.ok === true) return { kind: 'sent' };
  if (status === 429 && data.error === 'rate_limited') return { kind: 'limited' };
  if (status === 422 && data.ok === false && data.error === 'validation' && isRecord(data.fields)) {
    const fields: ContactErrors = {};
    for (const field of CONTACT_FIELDS) {
      if (typeof data.fields[field] === 'string' && data.fields[field].trim() !== '') fields[field] = fieldMessages[field];
    }
    if (Object.keys(fields).length > 0) return { kind: 'invalid', fields };
  }
  return { kind: 'failed' };
}

/** Read the host's literal cookie assignment; never execute its response script. */
export function parseChallengeCookie(text: string): string | null {
  const match = text.match(/document\.cookie\s*=\s*"([^"=]+=[^";]*)"/);
  if (!match || !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+=[\x21-\x3A\x3C-\x7E]*$/.test(match[1])) return null;
  return `${match[1]}; path=/`;
}

export interface ContactTransport {
  fetch: typeof fetch;
  setCookie: (cookie: string) => void;
}

export async function sendContact(data: FormData, transport: ContactTransport): Promise<ContactOutcome> {
  const body = encodeContact(data);
  const post = () => transport.fetch('/api/contact.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  let response: Response;
  try {
    response = await post();
    if (response.status === 409) {
      const cookie = parseChallengeCookie(await response.text());
      if (!cookie) return { kind: 'failed' };
      transport.setCookie(cookie);
      response = await post(); // Exactly one retry, with the same body.
      if (response.status === 409) return { kind: 'failed' };
    }
  } catch {
    return { kind: 'network' };
  }
  const result: unknown = await response.json().catch(() => null);
  return contactOutcome(response.status, result);
}
