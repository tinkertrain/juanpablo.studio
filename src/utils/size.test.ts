import { describe, it, expect } from 'vitest';
import { formatSize } from './size';

describe('formatSize', () => {
  it('shows centimeters and converted inches', () => {
    expect(formatSize(30, 40)).toBe('30cm x 40cm (11.8in x 15.7in)');
  });

  it('drops a trailing zero decimal', () => {
    expect(formatSize(25.4, 50.8)).toBe('25.4cm x 50.8cm (10in x 20in)');
  });

  it('returns null unless both dimensions are usable', () => {
    expect(formatSize(30, undefined)).toBeNull();
    expect(formatSize(undefined, 40)).toBeNull();
    expect(formatSize(undefined, undefined)).toBeNull();
    expect(formatSize(0, 40)).toBeNull();
    expect(formatSize(-30, 40)).toBeNull();
  });
});
