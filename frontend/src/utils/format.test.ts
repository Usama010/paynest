import { describe, it, expect } from 'vitest';
import { formatCents, formatTimeRemaining } from './format';

describe('formatCents', () => {
  it('formats whole dollars', () => {
    expect(formatCents(500)).toBe('$5.00');
  });

  it('formats cents', () => {
    expect(formatCents(1550)).toBe('$15.50');
  });

  it('formats large amounts with commas', () => {
    expect(formatCents(500000)).toBe('$5,000.00');
  });

  it('formats zero', () => {
    expect(formatCents(0)).toBe('$0.00');
  });
});

describe('formatTimeRemaining', () => {
  it('returns "Ended" for past times', () => {
    const past = new Date(Date.now() - 10000).toISOString();
    expect(formatTimeRemaining(past)).toBe('Ended');
  });

  it('returns seconds for short durations', () => {
    const future = new Date(Date.now() + 5000).toISOString();
    const result = formatTimeRemaining(future);
    expect(result).toMatch(/^\d+s$/);
  });

  it('returns minutes and seconds for medium durations', () => {
    const future = new Date(Date.now() + 125000).toISOString();
    const result = formatTimeRemaining(future);
    expect(result).toMatch(/^\d+m \d+s$/);
  });

  it('returns hours, minutes, and seconds for long durations', () => {
    const future = new Date(Date.now() + 3700000).toISOString();
    const result = formatTimeRemaining(future);
    expect(result).toMatch(/^\d+h \d+m \d+s$/);
  });
});
