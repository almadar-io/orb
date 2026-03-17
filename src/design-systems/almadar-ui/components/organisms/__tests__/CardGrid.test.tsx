/**
 * CardGrid Component Tests
 *
 * Tests for card grid functionality including search filtering via event bus
 * and URL navigation.
 */
import React, { useRef, useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CardGrid } from '../CardGrid';
import { EventBusProvider } from '../../../providers/EventBusProvider';
import { useEventBus } from '../../../hooks/useEventBus';

// Mock the useEntityData hooks
vi.mock('../../../hooks/useEntityData', () => ({
  useEntityList: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  usePaginatedEntityList: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
    goToPage: vi.fn(),
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    setPageSize: vi.fn(),
  })),
}));

// Test wrapper with providers
const createTestWrapper = (initialRoute = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <EventBusProvider debug={false}>
          <Routes>
            <Route path="*" element={children} />
          </Routes>
        </EventBusProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CardGrid', () => {
  const mockProducts = [
    { id: '1', name: 'Laptop', price: 999, category: 'Electronics' },
    { id: '2', name: 'Phone', price: 599, category: 'Electronics' },
    { id: '3', name: 'Desk Chair', price: 299, category: 'Furniture' },
    { id: '4', name: 'Coffee Mug', price: 15, category: 'Kitchen' },
  ];

  it('renders all items when no search term', () => {
    const TestWrapper = createTestWrapper();

    render(
      <TestWrapper>
        <CardGrid entity={mockProducts} fieldNames={['name', 'price']} />
      </TestWrapper>
    );

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Desk Chair')).toBeInTheDocument();
    expect(screen.getByText('Coffee Mug')).toBeInTheDocument();
  });

  it('filters items when UI:SEARCH event is received', async () => {
    const TestWrapper = createTestWrapper();

    // Component that provides a way to emit search events imperatively
    let emitSearch: (term: string) => void = () => {};
    const SearchController: React.FC = () => {
      const eventBus = useEventBus();
      emitSearch = (term: string) => {
        eventBus.emit('UI:SEARCH', { searchTerm: term });
      };
      return null;
    };

    render(
      <TestWrapper>
        <SearchController />
        <CardGrid entity={mockProducts} fieldNames={['name', 'price']} />
      </TestWrapper>
    );

    // Initially all items visible
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Desk Chair')).toBeInTheDocument();

    // Emit search event
    act(() => {
      emitSearch('lap');
    });

    // Wait for filter to apply
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.queryByText('Desk Chair')).not.toBeInTheDocument();
      expect(screen.queryByText('Phone')).not.toBeInTheDocument();
    });
  });

  it('filters by any field value (category)', async () => {
    const TestWrapper = createTestWrapper();

    let emitSearch: (term: string) => void = () => {};
    const SearchController: React.FC = () => {
      const eventBus = useEventBus();
      emitSearch = (term: string) => {
        eventBus.emit('UI:SEARCH', { searchTerm: term });
      };
      return null;
    };

    render(
      <TestWrapper>
        <SearchController />
        <CardGrid entity={mockProducts} fieldNames={['name', 'price', 'category']} />
      </TestWrapper>
    );

    // Initially all items visible
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Desk Chair')).toBeInTheDocument();

    // Search by category
    act(() => {
      emitSearch('Furniture');
    });

    // Should show only furniture items
    await waitFor(() => {
      expect(screen.getByText('Desk Chair')).toBeInTheDocument();
      expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
      expect(screen.queryByText('Phone')).not.toBeInTheDocument();
    });
  });

  it('clears filter when UI:CLEAR_SEARCH event is received', async () => {
    const TestWrapper = createTestWrapper();

    let emitSearch: (term: string) => void = () => {};
    let emitClear: () => void = () => {};
    const SearchController: React.FC = () => {
      const eventBus = useEventBus();
      emitSearch = (term: string) => {
        eventBus.emit('UI:SEARCH', { searchTerm: term });
      };
      emitClear = () => {
        eventBus.emit('UI:CLEAR_SEARCH', {});
      };
      return null;
    };

    render(
      <TestWrapper>
        <SearchController />
        <CardGrid entity={mockProducts} fieldNames={['name', 'price']} />
      </TestWrapper>
    );

    // First, apply a filter
    act(() => {
      emitSearch('Laptop');
    });

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.queryByText('Phone')).not.toBeInTheDocument();
    });

    // Then clear the filter
    act(() => {
      emitClear();
    });

    // All items should be visible again
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Desk Chair')).toBeInTheDocument();
      expect(screen.getByText('Coffee Mug')).toBeInTheDocument();
    });
  });

  it('emits UI:VIEW event with row data when action is clicked', async () => {
    const TestWrapper = createTestWrapper();
    const eventListener = vi.fn();

    const EventListener: React.FC = () => {
      const eventBus = useEventBus();
      useEffect(() => {
        const unsubscribe = eventBus.on('UI:VIEW', eventListener);
        return unsubscribe;
      }, [eventBus]);
      return null;
    };

    render(
      <TestWrapper>
        <EventListener />
        <CardGrid
          entity={mockProducts}
          fieldNames={['name', 'price']}
          itemActions={[{ label: 'View', event: 'VIEW' }]}
        />
      </TestWrapper>
    );

    // Click the View button on the first item
    const viewButtons = screen.getAllByRole('button', { name: 'View' });
    act(() => {
      viewButtons[0].click();
    });

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UI:VIEW',
        payload: expect.objectContaining({
          row: expect.objectContaining({ id: '1', name: 'Laptop' }),
        }),
      })
    );
  });
});

describe('CardGrid navigation', () => {
  const mockProducts = [
    { id: 'prod-123', name: 'Laptop', price: 999, category: 'Electronics' },
    { id: 'prod-456', name: 'Phone', price: 599, category: 'Electronics' },
  ];

  it('navigates to URL when navigatesTo is provided on action', async () => {
    let currentLocation = '/';

    // Component to track location changes
    const LocationTracker: React.FC = () => {
      const location = useLocation();
      currentLocation = location.pathname;
      return null;
    };

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products']}>
          <EventBusProvider debug={false}>
            <Routes>
              <Route
                path="/products"
                element={
                  <>
                    <LocationTracker />
                    <CardGrid
                      entity={mockProducts}
                      fieldNames={['name', 'price']}
                      itemActions={[{ label: 'View', navigatesTo: '/products/{{row.id}}' }]}
                    />
                  </>
                }
              />
              <Route path="/products/:id" element={<LocationTracker />} />
            </Routes>
          </EventBusProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Initially on /products
    expect(currentLocation).toBe('/products');

    // Click the View button on the first item
    const viewButtons = screen.getAllByRole('button', { name: 'View' });
    act(() => {
      viewButtons[0].click();
    });

    // Should navigate to /products/prod-123
    await waitFor(() => {
      expect(currentLocation).toBe('/products/prod-123');
    });
  });

  it('interpolates multiple fields in navigatesTo URL', async () => {
    let currentLocation = '/';

    const LocationTracker: React.FC = () => {
      const location = useLocation();
      currentLocation = location.pathname + location.search;
      return null;
    };

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const mockItems = [{ id: 'item-1', category: 'electronics', name: 'Laptop' }];

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <EventBusProvider debug={false}>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <LocationTracker />
                    <CardGrid
                      entity={mockItems}
                      fieldNames={['name']}
                      itemActions={[{ label: 'View', navigatesTo: '/{{row.category}}/{{row.id}}' }]}
                    />
                  </>
                }
              />
              <Route path="/:category/:id" element={<LocationTracker />} />
            </Routes>
          </EventBusProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const viewButtons = screen.getAllByRole('button', { name: 'View' });
    act(() => {
      viewButtons[0].click();
    });

    await waitFor(() => {
      expect(currentLocation).toBe('/electronics/item-1');
    });
  });

  it('does NOT emit event when navigatesTo is provided', async () => {
    const eventListener = vi.fn();
    const TestWrapper = createTestWrapper();

    const EventListener: React.FC = () => {
      const eventBus = useEventBus();
      useEffect(() => {
        const unsubscribe = eventBus.on('UI:VIEW', eventListener);
        return unsubscribe;
      }, [eventBus]);
      return null;
    };

    render(
      <TestWrapper>
        <EventListener />
        <CardGrid
          entity={mockProducts}
          fieldNames={['name', 'price']}
          itemActions={[{ label: 'View', navigatesTo: '/products/{{row.id}}' }]}
        />
      </TestWrapper>
    );

    const viewButtons = screen.getAllByRole('button', { name: 'View' });
    act(() => {
      viewButtons[0].click();
    });

    // Should NOT emit event when navigating
    expect(eventListener).not.toHaveBeenCalled();
  });
});
