import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from './supabase';

// Mock supabase
vi.mock('./supabase');

// Test component to use the auth hook
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user-email">{auth.user?.email || 'no user'}</div>
      <div data-testid="is-admin">{auth.isAdmin ? 'admin' : 'not admin'}</div>
      <button onClick={() => auth.signInWithEmail('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockSession = {
    access_token: 'test-token',
    refresh_token: 'test-refresh',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: {
      id: '123',
      email: 'test@example.com',
      app_metadata: { roles: ['user'] },
      user_metadata: {},
    },
  };

  const mockAdminSession = {
    ...mockSession,
    user: {
      ...mockSession.user,
      app_metadata: { roles: ['admin'] },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { 
        subscription: { 
          unsubscribe: vi.fn() 
        } 
      }
    });
  });

  it('should initialize with loading state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should load session on mount', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('should handle auth errors gracefully', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: null }, 
      error: new Error('Auth error') 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no user');
    });
  });

  it('should sign in with email', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { 
        user: mockSession.user,
        session: mockSession 
      },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    const signInButton = screen.getByText('Sign In');
    
    await act(async () => {
      signInButton.click();
    });

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('should sign out', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    });
    (supabase.auth.signOut as any).mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    const signOutButton = screen.getByText('Sign Out');
    
    await act(async () => {
      signOutButton.click();
    });

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('should detect admin users', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: mockAdminSession }, 
      error: null 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-admin')).toHaveTextContent('admin');
    });
  });

  it('should listen to auth state changes', async () => {
    let authChangeCallback: any;
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      authChangeCallback = callback;
      return {
        data: { 
          subscription: { 
            unsubscribe: vi.fn() 
          } 
        }
      };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Simulate auth state change
    act(() => {
      authChangeCallback('SIGNED_IN', mockSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});