import { vi } from 'vitest';

// Create chainable mock methods
const createChainableMock = (data: any = [], error: any = null) => {
  const mockResult = Promise.resolve({ data, error });
  
  const mock: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnValue(mockResult),
    then: vi.fn((callback) => mockResult.then(callback)),
  };
  
  // Make all methods return the mock for chaining
  Object.keys(mock).forEach(key => {
    if (key !== 'then' && key !== 'single') {
      mock[key].mockReturnValue(mock);
    }
  });
  
  return mock;
};

// Mock Supabase client for testing
export const mockSupabaseClient = {
  from: vi.fn((_table: string) => {
    const chainableMock = createChainableMock();
    
    // Add insert, update, delete methods
    chainableMock.insert = vi.fn().mockReturnValue(chainableMock);
    chainableMock.update = vi.fn().mockReturnValue(chainableMock);
    chainableMock.delete = vi.fn().mockReturnValue(chainableMock);
    
    return chainableMock;
  }),
  auth: {
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
    signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  }
};

// Mock Supabase createClient function
export const createClient = vi.fn(() => mockSupabaseClient);