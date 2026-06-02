import { describe, expect, it } from 'vitest';
import { clamp, clampInteger } from '../src/utils/clamp';

describe('clamp', () => {
  it('limits numeric values to a range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('rounds clamped integers', () => {
    expect(clampInteger(4.6, 1, 5)).toBe(5);
  });
});
