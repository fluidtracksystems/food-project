import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('../src/pages/contact.astro', import.meta.url), 'utf8');

describe('contact form contract and accessibility wiring', () => {
  it('has exactly the permitted named fields and an initially empty, inaccessible honeypot', () => {
    expect([...page.matchAll(/\sname="([^"]+)"/g)].map((match) => match[1])).toEqual(['name', 'email', 'message', 'hp_check']);
    expect(page).toMatch(/<div class="visually-hidden" aria-hidden="true">\s*<label for="contact-hp">Leave this field empty<\/label>\s*<input[^>]+name="hp_check"[^>]+value=""[^>]+tabindex="-1"[^>]+autocomplete="off"/);
  });
  it('ties field hints and errors to labelled inputs with matching native limits', () => {
    for (const [field, limit] of [['name', '100'], ['email', '254'], ['message', '5000']]) {
      expect(page).toContain(`for="contact-${field}"`);
      expect(page).toMatch(new RegExp(`id="contact-${field}"[^>]+required maxlength="${limit}"[^>]+aria-describedby="contact-${field}-hint contact-${field}-error"`));
      expect(page).toContain(`id="contact-${field}-error"`);
    }
    expect(page).toContain('type="email"');
  });
  it('provides status and error regions, noscript email, and blocks native submission before JS is ready', () => {
    expect(page).toContain('role="status" aria-live="polite"');
    expect(page).toContain('role="alert" tabindex="-1"');
    expect(page).toContain('<noscript>');
    expect(page).toContain('href={`mailto:${CONTACT_EMAIL}`}');
    expect(page).toContain('type="submit" disabled');
    expect(page).toContain("import '../scripts/contact'");
  });
});
