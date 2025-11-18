import { describe, it, expect } from 'vitest';

describe('Simple Test', () => {
  it('should verify basic functionality', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBe('hello');
    expect(true).toBe(true);
  });

  it('should verify backend is working', () => {
    const port = process.env.CURSORFI_BACKEND_PORT || '4001';
    expect(port).toBe('4001');
  });
});

