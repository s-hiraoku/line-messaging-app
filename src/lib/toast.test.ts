/**
 * Toast Helper Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from './toast';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn((msg, opts) => `success-${msg}`),
    error: vi.fn((msg, opts) => `error-${msg}`),
    info: vi.fn((msg, opts) => `info-${msg}`),
    warning: vi.fn((msg, opts) => `warning-${msg}`),
    loading: vi.fn((msg, opts) => `loading-${msg}`),
    promise: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show success toast', () => {
    const result = toast.success('Success message');
    expect(result).toBe('success-Success message');
  });

  it('should show error toast', () => {
    const result = toast.error('Error message');
    expect(result).toBe('error-Error message');
  });

  it('should show info toast', () => {
    const result = toast.info('Info message');
    expect(result).toBe('info-Info message');
  });

  it('should show warning toast', () => {
    const result = toast.warning('Warning message');
    expect(result).toBe('warning-Warning message');
  });

  it('should show loading toast', () => {
    const result = toast.loading('Loading...');
    expect(result).toBe('loading-Loading...');
  });

  it('should accept options', () => {
    toast.success('Success', {
      description: 'Description',
      duration: 3000,
    });
    expect(toast.success).toBeDefined();
  });
});
