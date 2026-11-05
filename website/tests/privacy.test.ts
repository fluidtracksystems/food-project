import { describe, expect, it } from 'vitest';
import { isContactEmail, privacyProblems } from '../src/lib/privacy';

const endpoint = 'https://forms.example.com/subscribe';

describe('privacyProblems', () => {
  it('has no problems when the signup is off, whatever else is set or missing', () => {
    expect(privacyProblems({})).toEqual([]);
    expect(privacyProblems({ signupEndpoint: undefined, providerName: undefined, contactEmail: undefined })).toEqual([]);
    expect(privacyProblems({ providerName: 'Provider', contactEmail: 'a@b.co' })).toEqual([]);
  });

  it('has no problems when the signup is on and both the provider and a contact are named', () => {
    expect(privacyProblems({ signupEndpoint: endpoint, providerName: 'Provider', contactEmail: 'hello@example.com' })).toEqual([]);
  });

  it('requires a provider name when the signup is on', () => {
    const problems = privacyProblems({ signupEndpoint: endpoint, contactEmail: 'hello@example.com' });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/provider/i);
  });

  it('requires a contact address when the signup is on', () => {
    const problems = privacyProblems({ signupEndpoint: endpoint, providerName: 'Provider' });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/contact/i);
  });

  it('reports both problems at once', () => {
    expect(privacyProblems({ signupEndpoint: endpoint })).toHaveLength(2);
  });

  it('treats a blank or whitespace provider name as missing', () => {
    expect(privacyProblems({ signupEndpoint: endpoint, providerName: '   ', contactEmail: 'a@b.co' })).toHaveLength(1);
    expect(privacyProblems({ signupEndpoint: endpoint, providerName: '', contactEmail: 'a@b.co' })).toHaveLength(1);
  });

  it('rejects a malformed contact address when the signup is on', () => {
    const problems = privacyProblems({ signupEndpoint: endpoint, providerName: 'Provider', contactEmail: 'not an email' });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/contact/i);
  });

  it('checks a contact address that is set even when the signup is off', () => {
    expect(privacyProblems({ contactEmail: 'not an email' })).toHaveLength(1);
    expect(privacyProblems({ contactEmail: 'hello@example.com' })).toEqual([]);
  });
});

describe('isContactEmail', () => {
  it.each(['a@b.co', 'hello@example.com', 'first.last+tag@sub.example.org', ' padded@example.com '])('accepts %j', (v) => {
    expect(isContactEmail(v)).toBe(true);
  });

  it.each(['', '   ', 'plain', '@example.com', 'a@', 'a@b', 'a b@example.com', 'a@@example.com', 'a@example..com', 'mailto:a@b.co'])(
    'rejects %j',
    (v) => {
      expect(isContactEmail(v)).toBe(false);
    },
  );

  it('rejects anything that could add mailto headers or break the link or the HTML', () => {
    // The address is rendered into href="mailto:...", so query strings, fragments and markup are refused.
    for (const v of [
      'a@b.com?cc=x',
      'a@b.com?subject=hi',
      'a@b.com#frag',
      'a&b@example.com',
      'a%20b@example.com',
      'a,b@example.com',
      '<a@b.co>',
      '"a"@b.co',
      "a'b@example.com",
      'a@b.com/path',
      'a@exa_mple.com',
      'a@-example.com',
    ]) {
      expect(isContactEmail(v), v).toBe(false);
    }
  });

  it('still accepts ordinary addresses', () => {
    for (const v of ['hello@example.com', 'first.last@example.co.nz', 'a_b-c+tag@sub-domain.example.org', 'A.B@Example.COM']) {
      expect(isContactEmail(v), v).toBe(true);
    }
  });

  it('rejects non-strings', () => {
    expect(isContactEmail(undefined as unknown as string)).toBe(false);
    expect(isContactEmail(5 as unknown as string)).toBe(false);
  });
});
