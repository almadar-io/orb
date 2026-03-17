/**
 * Tests for RuntimeDebugger component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RuntimeDebugger } from '../RuntimeDebugger';
import { EventBusProvider } from '../../../../providers/EventBusProvider';

// Wrapper to provide EventBusProvider context
const renderWithEventBus = (ui: React.ReactElement) => {
  return render(<EventBusProvider>{ui}</EventBusProvider>);
};

// Mock the debug utilities and registries
vi.mock('../../../../lib/debugUtils', () => ({
    isDebugEnabled: vi.fn(() => true),
    onDebugToggle: vi.fn((callback) => {
        // Return unsubscribe function
        return () => { };
    }),
}));

vi.mock('../../../../lib/debugRegistry', () => ({
    getDebugEvents: vi.fn(() => []),
    subscribeToDebugEvents: vi.fn(() => () => { }),
}));

vi.mock('../../../../lib/traitRegistry', () => ({
    getAllTraits: vi.fn(() => []),
    subscribeToTraitChanges: vi.fn(() => () => { }),
}));

vi.mock('../../../../lib/tickRegistry', () => ({
    getAllTicks: vi.fn(() => []),
    subscribeToTickChanges: vi.fn(() => () => { }),
}));

vi.mock('../../../../lib/guardRegistry', () => ({
    getGuardHistory: vi.fn(() => []),
    subscribeToGuardChanges: vi.fn(() => () => { }),
}));

vi.mock('../../../../lib/entityDebug', () => ({
    getEntitySnapshot: vi.fn(() => null),
}));

describe('RuntimeDebugger', () => {
    describe('collapsed state', () => {
        it('renders collapsed by default', () => {
            renderWithEventBus(<RuntimeDebugger />);
            expect(screen.getByTestId('debugger-collapsed')).toBeInTheDocument();
        });

        it('shows toggle button when collapsed', () => {
            renderWithEventBus(<RuntimeDebugger />);
            expect(screen.getByTitle(/Open Debugger/)).toBeInTheDocument();
        });
    });

    describe('expanded state', () => {
        it('expands when defaultCollapsed is false', () => {
            renderWithEventBus(<RuntimeDebugger defaultCollapsed={false} />);
            expect(screen.getByTestId('debugger-expanded')).toBeInTheDocument();
        });

        it('shows tabs when expanded', () => {
            renderWithEventBus(<RuntimeDebugger defaultCollapsed={false} />);
            expect(screen.getByText('Traits')).toBeInTheDocument();
            expect(screen.getByText('Ticks')).toBeInTheDocument();
            expect(screen.getByText('Entities')).toBeInTheDocument();
            expect(screen.getByText('Events')).toBeInTheDocument();
            expect(screen.getByText('Guards')).toBeInTheDocument();
        });

        it('shows title and close button', () => {
            renderWithEventBus(<RuntimeDebugger defaultCollapsed={false} />);
            expect(screen.getByText('KFlow Debugger')).toBeInTheDocument();
            expect(screen.getByTitle(/Close/)).toBeInTheDocument();
        });
    });

    describe('toggle behavior', () => {
        it('expands when toggle button is clicked', () => {
            renderWithEventBus(<RuntimeDebugger />);

            fireEvent.click(screen.getByTitle(/Open Debugger/));

            expect(screen.getByTestId('debugger-expanded')).toBeInTheDocument();
        });

        it('collapses when close button is clicked', () => {
            renderWithEventBus(<RuntimeDebugger defaultCollapsed={false} />);

            fireEvent.click(screen.getByTitle(/Close/));

            expect(screen.getByTestId('debugger-collapsed')).toBeInTheDocument();
        });
    });

    describe('position prop', () => {
        it('applies bottom-right position by default', () => {
            renderWithEventBus(<RuntimeDebugger />);
            // Position classes are on the element with the testid, not its parent
            const debugger_el = screen.getByTestId('debugger-collapsed').closest('.runtime-debugger');
            expect(debugger_el?.className).toContain('bottom-4');
            expect(debugger_el?.className).toContain('right-4');
        });

        it('applies top-left position when specified', () => {
            renderWithEventBus(<RuntimeDebugger position="top-left" />);
            // Position classes are on the element with the testid, not its parent
            const debugger_el = screen.getByTestId('debugger-collapsed').closest('.runtime-debugger');
            expect(debugger_el?.className).toContain('top-4');
            expect(debugger_el?.className).toContain('left-4');
        });
    });

    describe('visibility', () => {
        it('renders nothing when debug is disabled', async () => {
            vi.resetModules();
            vi.doMock('../../../../lib/debugUtils', () => ({
                isDebugEnabled: vi.fn(() => false),
                onDebugToggle: vi.fn(() => () => { }),
            }));

            // Need to re-import after mock change
            const { RuntimeDebugger: DisabledDebugger } = await import('../RuntimeDebugger');
            const { container } = render(<DisabledDebugger />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe('footer', () => {
        it('shows keyboard hint', () => {
            renderWithEventBus(<RuntimeDebugger defaultCollapsed={false} />);
            expect(screen.getByText(/Press ` to toggle/)).toBeInTheDocument();
        });
    });
});
