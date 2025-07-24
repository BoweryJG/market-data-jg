import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import { useAuth } from './AuthContext';

// Mock the auth context
vi.mock('./AuthContext');

describe('LoginForm', () => {
  const mockSignInWithProvider = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultAuthContext = {
    signInWithProvider: mockSignInWithProvider,
    loading: false,
    error: null,
    user: null,
    session: null,
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    isAdmin: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue(defaultAuthContext);
  });

  it('should render login form with both provider buttons', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
    expect(screen.getByText(/By signing in, you agree to our/)).toBeInTheDocument();
  });

  it('should handle Google login', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle Facebook login', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    const facebookButton = screen.getByText('Continue with Facebook');
    fireEvent.click(facebookButton);

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('facebook');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should show loading state when signing in', async () => {
    render(<LoginForm />);
    
    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);

    // Both buttons should show loading text when one is clicked
    const loadingButtons = screen.getAllByText('Signing in...');
    expect(loadingButtons).toHaveLength(2);
  });

  it('should disable buttons when loading', () => {
    (useAuth as any).mockReturnValue({
      ...defaultAuthContext,
      loading: true
    });

    render(<LoginForm />);
    
    const loadingButtons = screen.getAllByText('Signing in...');
    expect(loadingButtons).toHaveLength(2);
    
    const googleButton = loadingButtons[0].closest('button');
    const facebookButton = loadingButtons[1].closest('button');
    
    expect(googleButton).toBeDisabled();
    expect(facebookButton).toBeDisabled();
  });

  it('should display error message when auth error occurs', () => {
    const errorMessage = 'Authentication failed';
    (useAuth as any).mockReturnValue({
      ...defaultAuthContext,
      error: { message: errorMessage }
    });

    render(<LoginForm />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should not call onSuccess if login fails', async () => {
    mockSignInWithProvider.mockRejectedValue(new Error('Login failed'));
    
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('should have proper hover effects on buttons', () => {
    render(<LoginForm />);
    
    const googleButton = screen.getByText('Continue with Google').closest('button');
    
    // Simulate mouse enter
    fireEvent.mouseEnter(googleButton!);
    expect(googleButton?.style.transform).toBe('translateY(-2px)');
    
    // Simulate mouse leave
    fireEvent.mouseLeave(googleButton!);
    expect(googleButton?.style.transform).toBe('translateY(0)');
  });

  it('should not apply hover effects when disabled', () => {
    (useAuth as any).mockReturnValue({
      ...defaultAuthContext,
      loading: true
    });

    render(<LoginForm />);
    
    const loadingButtons = screen.getAllByText('Signing in...');
    const googleButton = loadingButtons[0].closest('button');
    
    // Simulate mouse enter
    fireEvent.mouseEnter(googleButton!);
    // Transform should not be applied when disabled
    expect(googleButton?.style.transform).not.toBe('translateY(-2px)');
  });

  it('should render Google and Facebook SVG icons', () => {
    render(<LoginForm />);
    
    // Check for Google icon colors
    expect(screen.getByText('Continue with Google').parentElement?.querySelector('path[fill="#FFC107"]')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google').parentElement?.querySelector('path[fill="#FF3D00"]')).toBeInTheDocument();
    
    // Check for Facebook icon
    expect(screen.getByText('Continue with Facebook').parentElement?.querySelector('path[fill="#1877f2"]')).toBeInTheDocument();
  });
});