/**
 * SearchInput Component Tests
 *
 * Tests for search input functionality including event bus integration.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';
import { EventBusProvider } from '../../../providers/EventBusProvider';
import { useEventBus } from '../../../hooks/useEventBus';

// Test wrapper with EventBusProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <EventBusProvider debug={false}>{children}</EventBusProvider>
);

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with placeholder', () => {
    render(
      <TestWrapper>
        <SearchInput placeholder="Search products..." />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
  });

  it('calls onSearch callback when typing', async () => {
    const onSearch = vi.fn();

    render(
      <TestWrapper>
        <SearchInput onSearch={onSearch} debounceMs={100} />
      </TestWrapper>
    );

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test query' } });

    // Advance timers to trigger debounced callback
    vi.advanceTimersByTime(100);

    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('emits UI:SEARCH event when event prop is provided', async () => {
    const eventListener = vi.fn();

    // Component that listens to events
    const EventListener: React.FC = () => {
      const eventBus = useEventBus();
      React.useEffect(() => {
        const unsubscribe = eventBus.on('UI:SEARCH', eventListener);
        return unsubscribe;
      }, [eventBus]);
      return null;
    };

    render(
      <TestWrapper>
        <EventListener />
        <SearchInput event="SEARCH" debounceMs={100} />
      </TestWrapper>
    );

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'laptop' } });

    // Advance timers to trigger debounced event
    vi.advanceTimersByTime(100);

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UI:SEARCH',
        payload: { searchTerm: 'laptop' },
      })
    );
  });

  it('emits UI:CLEAR_SEARCH event when cleared', async () => {
    const eventListener = vi.fn();

    const EventListener: React.FC = () => {
      const eventBus = useEventBus();
      React.useEffect(() => {
        const unsubscribe = eventBus.on('UI:CLEAR_SEARCH', eventListener);
        return unsubscribe;
      }, [eventBus]);
      return null;
    };

    render(
      <TestWrapper>
        <EventListener />
        <SearchInput event="SEARCH" debounceMs={100} clearable />
      </TestWrapper>
    );

    // Type something first
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    vi.advanceTimersByTime(100);

    // Clear the input (find the clear button)
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UI:CLEAR_SEARCH',
        payload: { searchTerm: '' },
      })
    );
  });

  it('does NOT emit events when event prop is not provided', async () => {
    const eventListener = vi.fn();

    const EventListener: React.FC = () => {
      const eventBus = useEventBus();
      React.useEffect(() => {
        const unsubscribe = eventBus.on('UI:SEARCH', eventListener);
        return unsubscribe;
      }, [eventBus]);
      return null;
    };

    render(
      <TestWrapper>
        <EventListener />
        <SearchInput debounceMs={100} />
      </TestWrapper>
    );

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    // Advance timers
    vi.advanceTimersByTime(100);

    // Should NOT have emitted any events
    expect(eventListener).not.toHaveBeenCalled();
  });
});
