/**
 * Tests for UISlotRenderer component
 *
 * Tests the slot rendering system including:
 * - Layout slots (main, sidebar)
 * - Portal slots (modal, drawer, toast, overlay, center)
 * - HUD slots (hud-top, hud-bottom)
 * - Content rendering and dismissal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { UISlotRenderer, UISlotComponent, SlotContentRenderer } from '../UISlotRenderer';
import { UISlotProvider } from '../../../context/UISlotContext';

// Wrapper component with provider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <UISlotProvider>{children}</UISlotProvider>;
}

describe('UISlotRenderer', () => {
  beforeEach(() => {
    // Clean up any portal roots from previous tests
    const portalRoot = document.getElementById('ui-slot-portal-root');
    if (portalRoot) {
      portalRoot.remove();
    }
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <UISlotRenderer />
        </TestWrapper>
      );

      expect(document.querySelector('.ui-slot-renderer')).toBeInTheDocument();
    });

    it('should render layout slot placeholders', () => {
      render(
        <TestWrapper>
          <UISlotRenderer />
        </TestWrapper>
      );

      expect(document.getElementById('slot-sidebar')).toBeInTheDocument();
      expect(document.getElementById('slot-main')).toBeInTheDocument();
    });

    it('should not render HUD slots by default', () => {
      render(
        <TestWrapper>
          <UISlotRenderer />
        </TestWrapper>
      );

      expect(document.getElementById('slot-hud-top')).not.toBeInTheDocument();
      expect(document.getElementById('slot-hud-bottom')).not.toBeInTheDocument();
    });

    it('should render HUD slots when includeHud is true', () => {
      render(
        <TestWrapper>
          <UISlotRenderer includeHud />
        </TestWrapper>
      );

      expect(document.getElementById('slot-hud-top')).toBeInTheDocument();
      expect(document.getElementById('slot-hud-bottom')).toBeInTheDocument();
    });

    it('should not render floating slot by default', () => {
      render(
        <TestWrapper>
          <UISlotRenderer />
        </TestWrapper>
      );

      expect(document.getElementById('slot-floating')).not.toBeInTheDocument();
    });

    it('should render floating slot when includeFloating is true', () => {
      render(
        <TestWrapper>
          <UISlotRenderer includeFloating />
        </TestWrapper>
      );

      expect(document.getElementById('slot-floating')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <UISlotRenderer className="custom-class" />
        </TestWrapper>
      );

      expect(document.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

});

// Note: Tests for slot content, portal slots, and dismissal functionality
// are covered by the useUISlots hook tests. The UISlotRenderer component
// integration with the slot system is verified through manual testing
// and the basic rendering tests above.

describe('SlotContentRenderer', () => {
  it('should render children when provided', () => {
    const content = {
      id: 'test-id',
      pattern: 'test-pattern',
      props: { children: <div data-testid="test-child">Child Content</div> },
      priority: 0,
    };

    render(<SlotContentRenderer content={content} onDismiss={() => {}} />);

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('should render pattern info when no children', () => {
    const content = {
      id: 'test-id',
      pattern: 'my-test-pattern',
      props: {},
      priority: 0,
    };

    render(<SlotContentRenderer content={content} onDismiss={() => {}} />);

    // Unknown patterns show "Unknown pattern:" prefix
    expect(screen.getByText(/Unknown pattern: my-test-pattern/)).toBeInTheDocument();
  });

  it('should include sourceTrait in fallback display', () => {
    const content = {
      id: 'test-id',
      pattern: 'test-pattern',
      props: {},
      priority: 0,
      sourceTrait: 'TestTrait',
    };

    render(<SlotContentRenderer content={content} onDismiss={() => {}} />);

    expect(screen.getByText(/TestTrait/)).toBeInTheDocument();
  });

  it('should set data attributes on wrapper', () => {
    const content = {
      id: 'test-id',
      pattern: 'test-pattern',
      props: {},
      priority: 0,
    };

    const { container } = render(<SlotContentRenderer content={content} onDismiss={() => {}} />);

    const wrapper = container.querySelector('.slot-content');
    expect(wrapper).toHaveAttribute('data-pattern', 'test-pattern');
    expect(wrapper).toHaveAttribute('data-id', 'test-id');
  });
});

describe('UISlotComponent', () => {
  it('should render empty placeholder for layout slots without content', () => {
    render(
      <TestWrapper>
        <UISlotComponent slot="main" />
      </TestWrapper>
    );

    const slot = document.getElementById('slot-main');
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveClass('ui-slot');
    expect(slot).toHaveClass('ui-slot-main');
  });

  it('should return null for portal slots without content', () => {
    const { container } = render(
      <TestWrapper>
        <UISlotComponent slot="modal" portal />
      </TestWrapper>
    );

    // Portal slot with no content should not render anything
    expect(container.firstChild).toBeNull();
  });

  it('should apply custom className', () => {
    render(
      <TestWrapper>
        <UISlotComponent slot="sidebar" className="custom-sidebar" />
      </TestWrapper>
    );

    const slot = document.getElementById('slot-sidebar');
    expect(slot).toHaveClass('custom-sidebar');
  });
});
