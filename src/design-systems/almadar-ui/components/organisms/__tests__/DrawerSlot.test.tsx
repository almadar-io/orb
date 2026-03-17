/**
 * DrawerSlot Component Tests
 *
 * Tests for drawer slot functionality including:
 * - Auto-open when children are present
 * - Auto-close when children are removed
 * - Close event dispatching
 * - Title extraction from children
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DrawerSlot } from '../DrawerSlot';
import { EventBusProvider } from '../../../providers/EventBusProvider';
import { useEventBus } from '../../../hooks/useEventBus';

// Test wrapper with EventBusProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <EventBusProvider debug={false}>{children}</EventBusProvider>
);

describe('DrawerSlot', () => {
  beforeEach(() => {
    // Clean up any styles or portal roots
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('rendering', () => {
    it('renders nothing when no children are provided', () => {
      const { container } = render(
        <TestWrapper>
          <DrawerSlot />
        </TestWrapper>
      );

      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('renders drawer when children are provided', () => {
      render(
        <TestWrapper>
          <DrawerSlot>
            <div data-testid="drawer-content">Content</div>
          </DrawerSlot>
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('renders drawer with custom title', () => {
      render(
        <TestWrapper>
          <DrawerSlot title="Custom Title">
            <div>Content</div>
          </DrawerSlot>
        </TestWrapper>
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('extracts title from child component props', () => {
      const ChildWithTitle: React.FC<{ title: string }> = ({ title }) => (
        <div data-testid="child-content">{title}</div>
      );

      render(
        <TestWrapper>
          <DrawerSlot>
            <ChildWithTitle title="Extracted Title" />
          </DrawerSlot>
        </TestWrapper>
      );

      // Title should appear in the drawer header (h2)
      const drawerTitle = document.getElementById('drawer-title');
      expect(drawerTitle).toBeInTheDocument();
      expect(drawerTitle?.textContent).toBe('Extracted Title');
    });

    it('prefers override title over extracted title', () => {
      const ChildWithTitle: React.FC<{ title: string }> = ({ title }) => (
        <div data-testid="child-content">{title}</div>
      );

      render(
        <TestWrapper>
          <DrawerSlot title="Override Title">
            <ChildWithTitle title="Child Title" />
          </DrawerSlot>
        </TestWrapper>
      );

      // The header should show "Override Title", not "Child Title"
      const drawerTitle = document.getElementById('drawer-title');
      expect(drawerTitle).toBeInTheDocument();
      expect(drawerTitle?.textContent).toBe('Override Title');
    });
  });

  describe('close behavior', () => {
    it('emits UI:CLOSE and UI:CANCEL events when close button is clicked', async () => {
      const closeListener = vi.fn();
      const cancelListener = vi.fn();

      const EventListener: React.FC = () => {
        const eventBus = useEventBus();
        React.useEffect(() => {
          const unsubClose = eventBus.on('UI:CLOSE', closeListener);
          const unsubCancel = eventBus.on('UI:CANCEL', cancelListener);
          return () => {
            unsubClose();
            unsubCancel();
          };
        }, [eventBus]);
        return null;
      };

      render(
        <TestWrapper>
          <EventListener />
          <DrawerSlot title="Test Drawer">
            <div>Content</div>
          </DrawerSlot>
        </TestWrapper>
      );

      // Click the close button
      const closeButton = screen.getByRole('button', { name: /close drawer/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(closeListener).toHaveBeenCalled();
        expect(cancelListener).toHaveBeenCalled();
      });
    });

    it('closes on escape key press', async () => {
      const closeListener = vi.fn();

      const EventListener: React.FC = () => {
        const eventBus = useEventBus();
        React.useEffect(() => {
          const unsub = eventBus.on('UI:CLOSE', closeListener);
          return unsub;
        }, [eventBus]);
        return null;
      };

      render(
        <TestWrapper>
          <EventListener />
          <DrawerSlot title="Test Drawer">
            <div>Content</div>
          </DrawerSlot>
        </TestWrapper>
      );

      // Press escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(closeListener).toHaveBeenCalled();
      });
    });
  });

  describe('positioning', () => {
    it('defaults to right position', () => {
      render(
        <TestWrapper>
          <DrawerSlot>
            <div>Content</div>
          </DrawerSlot>
        </TestWrapper>
      );

      const drawer = screen.getByRole('dialog');
      expect(drawer.className).toContain('right-0');
    });

    it('supports left position', () => {
      render(
        <TestWrapper>
          <DrawerSlot position="left">
            <div>Content</div>
          </DrawerSlot>
        </TestWrapper>
      );

      const drawer = screen.getByRole('dialog');
      expect(drawer.className).toContain('left-0');
    });
  });

  describe('sizing', () => {
    it('defaults to md size', () => {
      render(
        <TestWrapper>
          <DrawerSlot>
            <div>Content</div>
          </DrawerSlot>
        </TestWrapper>
      );

      const drawer = screen.getByRole('dialog');
      expect(drawer.className).toContain('w-96');
    });

    it('supports lg size', () => {
      render(
        <TestWrapper>
          <DrawerSlot size="lg">
            <div>Content</div>
          </DrawerSlot>
        </TestWrapper>
      );

      const drawer = screen.getByRole('dialog');
      expect(drawer.className).toContain('w-[480px]');
    });
  });
});
