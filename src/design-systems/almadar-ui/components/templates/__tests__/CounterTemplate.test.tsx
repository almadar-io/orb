/**
 * CounterTemplate Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CounterTemplate } from '../CounterTemplate';
import type { CounterEntity } from '../CounterTemplate';


function makeEntity(overrides: Partial<CounterEntity> = {}): CounterEntity {
  return {
    id: 'counter-1',
    count: 0,
    ...overrides,
  };
}

describe('CounterTemplate', () => {
  describe('Rendering', () => {
    it('should render the count value', () => {
      render(<CounterTemplate entity={makeEntity({ count: 42 })} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render the title', () => {
      render(<CounterTemplate entity={makeEntity()} title="My Counter" />);
      expect(screen.getByText('My Counter')).toBeInTheDocument();
    });

    it('should render increment and decrement buttons', () => {
      render(<CounterTemplate entity={makeEntity({ count: 5 })} />);
      // Look for buttons with Plus and Minus icons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should render reset button when showReset is true', () => {
      render(<CounterTemplate entity={makeEntity({ count: 5 })} showReset={true} />);
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should not render reset button when showReset is false', () => {
      render(<CounterTemplate entity={makeEntity({ count: 5 })} showReset={false} />);
      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onIncrement when increment button is clicked', () => {
      const onIncrement = vi.fn();
      render(<CounterTemplate entity={makeEntity()} onIncrement={onIncrement} />);

      // Get all buttons except Reset, find the primary button with border-2 (unique to primary variant)
      const buttons = screen.getAllByRole('button').filter(btn => !btn.textContent?.includes('Reset'));
      // Primary button (increment) has border-2 class which is unique to primary variant
      const incrementButton = buttons.find(btn => btn.className.includes('border-2'));

      if (incrementButton) {
        fireEvent.click(incrementButton);
        expect(onIncrement).toHaveBeenCalledTimes(1);
      } else {
        // Fallback: click the second button (increment is usually second)
        fireEvent.click(buttons[1] || buttons[0]);
        expect(onIncrement).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onDecrement when decrement button is clicked', () => {
      const onDecrement = vi.fn();
      render(<CounterTemplate entity={makeEntity({ count: 5 })} onDecrement={onDecrement} />);

      // Get all buttons except Reset, find the one with neutral-300 border (secondary)
      const buttons = screen.getAllByRole('button').filter(btn => !btn.textContent?.includes('Reset'));
      // Secondary button (decrement) has neutral-300 class
      const decrementButton = buttons.find(btn => btn.className.includes('neutral-300'));

      if (decrementButton) {
        fireEvent.click(decrementButton);
        expect(onDecrement).toHaveBeenCalledTimes(1);
      } else {
        // Fallback: click the first button (decrement is usually first)
        fireEvent.click(buttons[0]);
        expect(onDecrement).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onReset when reset button is clicked', () => {
      const onReset = vi.fn();
      render(<CounterTemplate entity={makeEntity({ count: 5 })} onReset={onReset} />);

      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Constraints', () => {
    it('should disable decrement when decrementDisabled is true', () => {
      render(<CounterTemplate entity={makeEntity({ count: 0, decrementDisabled: true })} />);

      // Find the secondary (decrement) button - it should be disabled
      const buttons = screen.getAllByRole('button').filter(btn => !btn.textContent?.includes('Reset'));
      const decrementButton = buttons.find(btn => btn.className.includes('neutral-300')) || buttons[0];

      expect(decrementButton).toBeDisabled();
    });

    it('should disable increment when incrementDisabled is true', () => {
      render(<CounterTemplate entity={makeEntity({ count: 10, incrementDisabled: true })} />);

      // Find the primary (increment) button - it should be disabled
      // Primary button has border-2 class which is unique to primary variant
      const buttons = screen.getAllByRole('button').filter(btn => !btn.textContent?.includes('Reset'));
      const incrementButton = buttons.find(btn => btn.className.includes('border-2')) || buttons[1] || buttons[0];

      expect(incrementButton).toBeDisabled();
    });
  });

  describe('Variants', () => {
    it('should render minimal variant', () => {
      const { container } = render(<CounterTemplate entity={makeEntity({ count: 5 })} variant="minimal" />);
      // Minimal variant doesn't have Container wrapper
      expect(container.querySelector('.mx-auto')).not.toBeInTheDocument();
    });

    it('should render standard variant with title', () => {
      render(<CounterTemplate entity={makeEntity({ count: 5 })} variant="standard" title="Counter" />);
      expect(screen.getByText('Counter')).toBeInTheDocument();
    });

    it('should render full variant with range info', () => {
      render(<CounterTemplate entity={makeEntity({ count: 5, rangeText: 'Range: 0 to 100' })} variant="full" />);
      expect(screen.getByText(/Range:/)).toBeInTheDocument();
    });
  });
});
