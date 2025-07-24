import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';

// Mock the auth context
vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    loading: false,
  }),
}));

describe('Dashboard', () => {
  it('renders without crashing', async () => {
    render(<Dashboard />);
    // Wait for loading to complete and check for rendered content
    await waitFor(() => {
      expect(screen.queryByText(/loading data/i)).not.toBeInTheDocument();
    });
    // The component should render successfully with the dashboard title
    expect(screen.getByText(/market intelligence dashboard/i)).toBeInTheDocument();
  });
});