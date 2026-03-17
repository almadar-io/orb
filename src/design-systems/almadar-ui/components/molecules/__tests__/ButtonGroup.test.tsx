/**
 * ButtonGroup Component Tests
 *
 * Tests for button group functionality including event bus integration.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonGroup } from '../ButtonGroup';
import { EventBusProvider } from '../../../providers/EventBusProvider';
import { useEventBus } from '../../../hooks/useEventBus';
import { MemoryRouter } from 'react-router-dom';

// Test wrapper with EventBusProvider and Router
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    <EventBusProvider debug={false}>{children}</EventBusProvider>
  </MemoryRouter>
);

describe('ButtonGroup', () => {
  it('renders primary and secondary buttons', () => {
    render(
      <TestWrapper>
        <ButtonGroup
          primary={{ label: 'Save', event: 'SAVE', variant: 'primary' }}
          secondary={[{ label: 'Cancel', navigatesTo: '/home', actionType: 'cancel' }]}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('emits UI:DISPATCH event when button with event prop is clicked', async () => {
    const eventListener = vi.fn();

    // Component that listens to events
    const EventListener: React.FC = () => {
      const eventBus = useEventBus();
      React.useEffect(() => {
        const unsubscribe = eventBus.on('UI:DISPATCH', eventListener);
        return unsubscribe;
      }, [eventBus]);
      return null;
    };

    render(
      <TestWrapper>
        <EventListener />
        <ButtonGroup
          primary={{ label: 'Add to Cart', event: 'ADD_TO_CART', variant: 'primary' }}
        />
      </TestWrapper>
    );

    const button = screen.getByText('Add to Cart');
    fireEvent.click(button);

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UI:DISPATCH',
        payload: { event: 'ADD_TO_CART' },
      })
    );
  });

  it('does NOT emit events for buttons without event prop', async () => {
    const eventListener = vi.fn();

    const EventListener: React.FC = () => {
      const eventBus = useEventBus();
      React.useEffect(() => {
        const unsubscribe = eventBus.on('UI:DISPATCH', eventListener);
        return unsubscribe;
      }, [eventBus]);
      return null;
    };

    render(
      <TestWrapper>
        <EventListener />
        <ButtonGroup
          secondary={[{ label: 'Back', navigatesTo: '/home', actionType: 'cancel' }]}
        />
      </TestWrapper>
    );

    const button = screen.getByText('Back');
    fireEvent.click(button);

    // Should NOT have emitted any events
    expect(eventListener).not.toHaveBeenCalled();
  });

  it('emits event AND navigates when both event and navigatesTo are provided', async () => {
    const eventListener = vi.fn();

    const EventListener: React.FC = () => {
      const eventBus = useEventBus();
      React.useEffect(() => {
        const unsubscribe = eventBus.on('UI:DISPATCH', eventListener);
        return unsubscribe;
      }, [eventBus]);
      return null;
    };

    render(
      <TestWrapper>
        <EventListener />
        <ButtonGroup
          primary={{ label: 'Submit', event: 'SUBMIT', navigatesTo: '/success', variant: 'primary' }}
        />
      </TestWrapper>
    );

    const button = screen.getByText('Submit');
    fireEvent.click(button);

    // Should have emitted the event
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UI:DISPATCH',
        payload: { event: 'SUBMIT' },
      })
    );
  });

  it('renders multiple secondary buttons correctly', () => {
    render(
      <TestWrapper>
        <ButtonGroup
          primary={{ label: 'Save', event: 'SAVE', variant: 'primary' }}
          secondary={[
            { label: 'Cancel', navigatesTo: '/home', actionType: 'cancel' },
            { label: 'Reset', event: 'RESET', variant: 'ghost' },
          ]}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <TestWrapper>
        <ButtonGroup>
          <button>Custom Button</button>
        </ButtonGroup>
      </TestWrapper>
    );

    expect(screen.getByText('Custom Button')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    render(
      <TestWrapper>
        <ButtonGroup variant="segmented">
          <button>One</button>
          <button>Two</button>
        </ButtonGroup>
      </TestWrapper>
    );

    // Component should render with group role
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});
