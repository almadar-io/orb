/**
 * FilterGroup Component Tests
 *
 * Tests for filter group functionality including date filter support.
 */
import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterGroup, FilterDefinition } from '../FilterGroup';
import { EventBusProvider } from '../../../providers/EventBusProvider';

// Wrapper to provide EventBusProvider context
const TestWrapper = ({ children }: { children: ReactNode }) => (
    <EventBusProvider>{children}</EventBusProvider>
);

const renderWithProvider = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
};

describe('FilterGroup', () => {
    const mockOnFilterChange = vi.fn();
    const mockOnClearAll = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders select filters with options', () => {
        const filters: FilterDefinition[] = [
            { field: 'status', label: 'Status', options: ['active', 'dormant', 'terminated'] },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Connection"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
            />
        );

        // Should render the filter label
        expect(screen.getByText('Status')).toBeInTheDocument();

        // Should render a select element
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
    });

    it('renders date filter as date input when filterType is "date"', () => {
        const filters: FilterDefinition[] = [
            { field: 'assessmentDate', label: 'Assessment Date', filterType: 'date' },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Assessment"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
            />
        );

        // Should render the filter label
        expect(screen.getByText('Assessment Date')).toBeInTheDocument();

        // Should render a date input
        const dateInput = document.querySelector('input[type="date"]');
        expect(dateInput).toBeInTheDocument();
    });

    it('calls onFilterChange when date filter value changes', () => {
        const filters: FilterDefinition[] = [
            { field: 'assessmentDate', label: 'Assessment Date', filterType: 'date' },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Assessment"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
            />
        );

        const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2025-06-15' } });

        expect(mockOnFilterChange).toHaveBeenCalledWith('assessmentDate', '2025-06-15');
    });

    it('calls onFilterChange with null when date is cleared', () => {
        const filters: FilterDefinition[] = [
            { field: 'assessmentDate', label: 'Assessment Date', filterType: 'date' },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Assessment"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
            />
        );

        const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;

        // Set a value first
        fireEvent.change(dateInput, { target: { value: '2025-06-15' } });

        // Clear the value
        fireEvent.change(dateInput, { target: { value: '' } });

        expect(mockOnFilterChange).toHaveBeenLastCalledWith('assessmentDate', null);
    });

    it('renders mixed filter types correctly', () => {
        const filters: FilterDefinition[] = [
            { field: 'status', label: 'Status', options: ['active', 'dormant'] },
            { field: 'assessmentDate', label: 'Assessment Date', filterType: 'date' },
            { field: 'category', label: 'Category', options: ['A', 'B', 'C'] },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Assessment"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
            />
        );

        // Should render all labels
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Assessment Date')).toBeInTheDocument();
        expect(screen.getByText('Category')).toBeInTheDocument();

        // Should render date input
        const dateInput = document.querySelector('input[type="date"]');
        expect(dateInput).toBeInTheDocument();

        // Should render two select elements (status and category)
        const selects = screen.getAllByRole('combobox');
        expect(selects).toHaveLength(2);
    });

    it('renders daterange filter with two date inputs', () => {
        const filters: FilterDefinition[] = [
            { field: 'createdAt', label: 'Created Date', filterType: 'daterange' },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Assessment"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
            />
        );

        // Should render the filter label
        expect(screen.getByText('Created Date')).toBeInTheDocument();

        // Should render two date inputs (from and to)
        const dateInputs = document.querySelectorAll('input[type="date"]');
        expect(dateInputs).toHaveLength(2);
    });

    it('renders date-range filter (with hyphen) with two date inputs', () => {
        const filters: FilterDefinition[] = [
            { field: 'assessmentDate', label: 'Assessment Date', filterType: 'date-range' },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Assessment"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
            />
        );

        // Should render the filter label
        expect(screen.getByText('Assessment Date')).toBeInTheDocument();

        // Should render two date inputs (from and to)
        const dateInputs = document.querySelectorAll('input[type="date"]');
        expect(dateInputs).toHaveLength(2);
    });

    it('handles daterange filter changes correctly', () => {
        const filters: FilterDefinition[] = [
            { field: 'createdAt', label: 'Created Date', filterType: 'daterange' },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Assessment"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
            />
        );

        const dateInputs = document.querySelectorAll('input[type="date"]');
        const fromInput = dateInputs[0] as HTMLInputElement;
        const toInput = dateInputs[1] as HTMLInputElement;

        // Change from date
        fireEvent.change(fromInput, { target: { value: '2025-01-01' } });
        expect(mockOnFilterChange).toHaveBeenCalledWith('createdAt_from', '2025-01-01');

        // Change to date
        fireEvent.change(toInput, { target: { value: '2025-12-31' } });
        expect(mockOnFilterChange).toHaveBeenCalledWith('createdAt_to', '2025-12-31');
    });

    it('renders in compact variant with date filters', () => {
        const filters: FilterDefinition[] = [
            { field: 'assessmentDate', label: 'Assessment Date', filterType: 'date' },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Assessment"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
                variant="compact"
            />
        );

        // Should render date input in compact mode
        const dateInput = document.querySelector('input[type="date"]');
        expect(dateInput).toBeInTheDocument();
    });

    it('calls onClearAll when clear all button is clicked', () => {
        const filters: FilterDefinition[] = [
            { field: 'status', label: 'Status', options: ['active', 'dormant'] },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Connection"
                filters={filters}
                onFilterChange={mockOnFilterChange}
                onClearAll={mockOnClearAll}
            />
        );

        // First set a filter to show the clear button
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'active' } });

        // Find and click clear all button
        const clearButton = screen.getByText(/Clear/i);
        fireEvent.click(clearButton);

        expect(mockOnClearAll).toHaveBeenCalled();
    });
});

describe('FilterGroup filter type inference', () => {
    it('renders select by default when no filterType specified', () => {
        const filters: FilterDefinition[] = [
            { field: 'status', label: 'Status', options: ['active', 'dormant'] },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Connection"
                filters={filters}
                onFilterChange={vi.fn()}
            />
        );

        // Should render a select element
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
    });

    it('renders date input when filterType is explicitly "date"', () => {
        const filters: FilterDefinition[] = [
            { field: 'someField', label: 'Some Field', filterType: 'date' },
        ];

        renderWithProvider(
            <FilterGroup
                entity="Test"
                filters={filters}
                onFilterChange={vi.fn()}
            />
        );

        // Should render a date input, not a select
        const dateInput = document.querySelector('input[type="date"]');
        const select = screen.queryByRole('combobox');

        expect(dateInput).toBeInTheDocument();
        expect(select).not.toBeInTheDocument();
    });
});
