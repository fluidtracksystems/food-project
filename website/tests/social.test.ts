import { describe, expect, it } from 'vitest';
import { sanitizeSocialLinks, socialDestination } from '../src/lib/social';

describe('socialDestination', () => {
  it('recognises Pinterest and Instagram, including www and subdomains', () => {
    expect(socialDestination('https://www.pinterest.com/chef/')).toBe('pinterest');
    expect(socialDestination('https://pinterest.com/chef/')).toBe('pinterest');
    expect(socialDestination('https://nz.pinterest.com/chef/')).toBe('pinterest');
    expect(socialDestination('https://www.instagram.com/chef/')).toBe('instagram');
  });

  it('rejects other hosts, look-alikes and non-https', () => {
    expect(socialDestination('https://facebook.com/chef')).toBeUndefined();
    expect(socialDestination('https://pinterest.com.evil.example/')).toBeUndefined();
    expect(socialDestination('https://evilpinterest.com/')).toBeUndefined();
    expect(socialDestination('http://www.pinterest.com/chef/')).toBeUndefined();
    expect(socialDestination('javascript:alert(1)')).toBeUndefined();
    expect(socialDestination('/relative')).toBeUndefined();
    expect(socialDestination('')).toBeUndefined();
  });

  it('rejects credentials in the URL', () => {
    expect(socialDestination('https://user:pw@www.pinterest.com/chef/')).toBeUndefined();
  });
});

describe('sanitizeSocialLinks', () => {
  it('keeps good links and adds the destination', () => {
    expect(
      sanitizeSocialLinks([
        { label: 'Pinterest', href: 'https://www.pinterest.com/chef/' },
        { label: 'Instagram', href: 'https://www.instagram.com/chef/' },
      ]),
    ).toEqual([
      { label: 'Pinterest', href: 'https://www.pinterest.com/chef/', destination: 'pinterest' },
      { label: 'Instagram', href: 'https://www.instagram.com/chef/', destination: 'instagram' },
    ]);
  });

  it('drops bad links instead of shipping them', () => {
    expect(
      sanitizeSocialLinks([
        { label: 'Pinterest', href: 'javascript:alert(1)' },
        { label: 'Facebook', href: 'https://facebook.com/chef' },
        { label: 'Instagram', href: 'https://www.instagram.com/chef/' },
      ]).map((l) => l.label),
    ).toEqual(['Instagram']);
  });

  it('drops a link with a blank label', () => {
    expect(sanitizeSocialLinks([{ label: '  ', href: 'https://www.pinterest.com/chef/' }])).toEqual([]);
  });

  it('returns an empty list for an empty list', () => {
    expect(sanitizeSocialLinks([])).toEqual([]);
  });
});
