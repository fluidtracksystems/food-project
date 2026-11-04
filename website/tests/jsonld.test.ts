import { describe, expect, it } from 'vitest';
import { toJsonLdString } from '../src/lib/jsonld';

describe('toJsonLdString', () => {
  it('serializes plain data unchanged', () => {
    expect(toJsonLdString({ a: 1 })).toBe('{"a":1}');
  });

  it('escapes "<" so text cannot close the script tag', () => {
    const out = toJsonLdString({ text: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c/script>');
  });

  it('round-trips through JSON.parse after escaping', () => {
    const data = { text: '</script> & "quotes"' };
    expect(JSON.parse(toJsonLdString(data))).toEqual(data);
  });
});
