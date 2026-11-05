import { describe, expect, it } from 'vitest';
import { resolveSignupAction } from '../src/lib/email';

describe('resolveSignupAction', () => {
  it('returns undefined when nothing is configured', () => {
    expect(resolveSignupAction(undefined)).toBeUndefined();
    expect(resolveSignupAction('')).toBeUndefined();
    expect(resolveSignupAction('   ')).toBeUndefined();
  });

  it('accepts an https endpoint and normalises it', () => {
    expect(resolveSignupAction(' https://forms.example.com/subscribe ')).toBe('https://forms.example.com/subscribe');
  });

  it('refuses anything that is not https, so a form can never post an address over plain http', () => {
    expect(resolveSignupAction('http://forms.example.com/subscribe')).toBeUndefined();
    expect(resolveSignupAction('javascript:alert(1)')).toBeUndefined();
    expect(resolveSignupAction('data:text/html,hi')).toBeUndefined();
    expect(resolveSignupAction('//forms.example.com/x')).toBeUndefined();
    expect(resolveSignupAction('/relative')).toBeUndefined();
    expect(resolveSignupAction('not a url')).toBeUndefined();
  });

  it('refuses an endpoint with embedded credentials', () => {
    expect(resolveSignupAction('https://user:pass@forms.example.com/x')).toBeUndefined();
  });

  it('ignores non-strings', () => {
    expect(resolveSignupAction(5 as unknown as string)).toBeUndefined();
    expect(resolveSignupAction(true as unknown as string)).toBeUndefined();
  });
});
