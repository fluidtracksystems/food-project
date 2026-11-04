import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from '../src/lib/contrast';

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('accepts lower-case hex', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#A8472A', '#A8472A')).toBeCloseTo(1, 2);
  });

  it('does not depend on argument order', () => {
    expect(contrastRatio('#3A2A1F', '#FBF6EE')).toBeCloseTo(contrastRatio('#FBF6EE', '#3A2A1F'), 5);
  });

  it('matches the documented accent on bg ratio', () => {
    expect(contrastRatio('#A8472A', '#FBF6EE')).toBeCloseTo(5.42, 2);
  });

  it('matches the documented text on bg ratio', () => {
    expect(contrastRatio('#3A2A1F', '#FBF6EE')).toBeCloseTo(12.75, 2);
  });

  it('throws for a colour name', () => {
    expect(() => contrastRatio('red', '#FFFFFF')).toThrow(/invalid hex colour "red"/);
  });

  it('throws for 3-digit hex', () => {
    expect(() => contrastRatio('#fff', '#FFFFFF')).toThrow(/invalid hex colour "#fff"/);
  });
});
