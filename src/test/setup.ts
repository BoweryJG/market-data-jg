import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase client for tests
vi.mock('../auth/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}));