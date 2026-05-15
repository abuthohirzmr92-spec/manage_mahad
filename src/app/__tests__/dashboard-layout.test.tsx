import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { useAuthStore } from '@/store/auth-store';
import DashboardLayout from '../dashboard/layout';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => '/dashboard'),
}));

vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

vi.mock('@/components/layout/topbar', () => ({
  Topbar: () => <div data-testid="topbar" />,
}));

vi.mock('@/components/layout/breadcrumb', () => ({
  Breadcrumb: () => <div data-testid="breadcrumb" />,
}));

vi.mock('@/store/sidebar-store', () => ({
  useSidebarStore: vi.fn(() => ({ isCollapsed: false })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setAuthState(overrides: Partial<ReturnType<typeof useAuthStore.getState>>) {
  useAuthStore.setState({
    user: null,
    firebaseUser: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardLayout', () => {
  it('shows loading spinner when auth isLoading is true', () => {
    setAuthState({ isLoading: true, isAuthenticated: false, user: null });

    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    expect(screen.getByText('Memuat...')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    // Sidebar, topbar, breadcrumb should not render during loading
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('topbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument();
    // Should NOT redirect when loading
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to / when not authenticated and not loading', () => {
    setAuthState({ isLoading: false, isAuthenticated: false, user: null });

    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('renders children when authenticated', () => {
    setAuthState({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@mahad.sch.id',
        role: 'admin',
      },
    });

    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByText('Memuat...')).not.toBeInTheDocument();
    // Layout components should render
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    // Should NOT redirect when authenticated
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('returns null when not authenticated after loading completes', () => {
    setAuthState({ isLoading: false, isAuthenticated: false, user: null });

    const { container } = render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    // Should render nothing visible (null return, redirect handled by useEffect)
    expect(container.innerHTML).toBe('');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('does not redirect when still loading even if unauthenticated', () => {
    setAuthState({ isLoading: true, isAuthenticated: false, user: null });

    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    // Still shows loading, should not redirect
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
