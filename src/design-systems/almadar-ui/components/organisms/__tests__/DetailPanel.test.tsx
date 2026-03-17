/**
 * DetailPanel Component Tests
 *
 * Tests for detail panel functionality including selectedEntity from event bus.
 */
import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DetailPanel } from '../DetailPanel';
import { EventBusProvider } from '../../../providers/EventBusProvider';
import { useEventBus } from '../../../hooks/useEventBus';

// Mock the useEntityDetail hook
vi.mock('../../../hooks/useEntityData', () => ({
  useEntityDetail: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
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

describe('DetailPanel', () => {
  const mockProduct = {
    id: '1',
    name: 'Premium Laptop',
    description: 'A high-performance laptop',
    price: 1299,
    category: 'Electronics',
    sku: 'LAPTOP-001',
    inStock: true,
  };

  it('renders with explicit data prop', () => {
    const TestWrapper = createTestWrapper();

    render(
      <TestWrapper>
        <DetailPanel
          entity={mockProduct}
          fieldNames={['name', 'price', 'category']}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Premium Laptop')).toBeInTheDocument();
    expect(screen.getByText('1,299')).toBeInTheDocument();
  });

  it('uses selectedEntity from event bus when UI:VIEW is emitted', async () => {
    const TestWrapper = createTestWrapper();

    // Component that provides a way to emit events imperatively
    let emitView: (entity: typeof mockProduct) => void = () => {};
    const EventController: React.FC = () => {
      const eventBus = useEventBus();
      emitView = (entity) => {
        eventBus.emit('UI:VIEW', { row: entity });
      };
      return null;
    };

    render(
      <TestWrapper>
        <EventController />
        <DetailPanel
          fieldNames={['name', 'price', 'category']}
        />
      </TestWrapper>
    );

    // Initially shows empty state (no data)
    expect(screen.getByText('Not Found')).toBeInTheDocument();

    // Emit VIEW event with entity
    act(() => {
      emitView(mockProduct);
    });

    // The detail panel should display the selected entity
    await waitFor(() => {
      expect(screen.getByText('Premium Laptop')).toBeInTheDocument();
    });
  });

  it('uses selectedEntity from UI:SELECT event', async () => {
    const TestWrapper = createTestWrapper();

    let emitSelect: (entity: typeof mockProduct) => void = () => {};
    const EventController: React.FC = () => {
      const eventBus = useEventBus();
      emitSelect = (entity) => {
        eventBus.emit('UI:SELECT', { row: entity });
      };
      return null;
    };

    render(
      <TestWrapper>
        <EventController />
        <DetailPanel
          fieldNames={['name', 'price', 'category']}
        />
      </TestWrapper>
    );

    // Initially shows empty state
    expect(screen.getByText('Not Found')).toBeInTheDocument();

    // Emit SELECT event
    act(() => {
      emitSelect(mockProduct);
    });

    await waitFor(() => {
      expect(screen.getByText('Premium Laptop')).toBeInTheDocument();
    });
  });

  it('clears selectedEntity when UI:CLOSE is emitted', async () => {
    const TestWrapper = createTestWrapper();

    let emitSelect: (entity: typeof mockProduct) => void = () => {};
    let emitClose: () => void = () => {};
    const EventController: React.FC = () => {
      const eventBus = useEventBus();
      emitSelect = (entity) => {
        eventBus.emit('UI:SELECT', { row: entity });
      };
      emitClose = () => {
        eventBus.emit('UI:CLOSE', {});
      };
      return null;
    };

    render(
      <TestWrapper>
        <EventController />
        <DetailPanel
          fieldNames={['name', 'price', 'category']}
        />
      </TestWrapper>
    );

    // Select an entity
    act(() => {
      emitSelect(mockProduct);
    });

    // First, entity should be displayed
    await waitFor(() => {
      expect(screen.getByText('Premium Laptop')).toBeInTheDocument();
    });

    // Then emit close event
    act(() => {
      emitClose();
    });

    // Entity should no longer be displayed (shows empty state)
    await waitFor(() => {
      expect(screen.queryByText('Premium Laptop')).not.toBeInTheDocument();
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });
  });

  it('prioritizes explicit data prop over selectedEntity', async () => {
    const TestWrapper = createTestWrapper();
    const explicitData = { ...mockProduct, name: 'Explicit Product' };

    let emitSelect: (entity: typeof mockProduct) => void = () => {};
    const EventController: React.FC = () => {
      const eventBus = useEventBus();
      emitSelect = (entity) => {
        eventBus.emit('UI:SELECT', { row: entity });
      };
      return null;
    };

    render(
      <TestWrapper>
        <EventController />
        <DetailPanel
          entity={explicitData}
          fieldNames={['name', 'price']}
        />
      </TestWrapper>
    );

    // Should show explicit data
    expect(screen.getByText('Explicit Product')).toBeInTheDocument();

    // Even after emitting select, explicit data should still be shown
    act(() => {
      emitSelect(mockProduct);
    });

    // Should still show explicit data, not selectedEntity
    await waitFor(() => {
      expect(screen.getByText('Explicit Product')).toBeInTheDocument();
      expect(screen.queryByText('Premium Laptop')).not.toBeInTheDocument();
    });
  });
});
