/**
 * StatCard Component Tests
 *
 * Ensures StatCard correctly:
 * - Renders all metrics (not just the first one)
 * - Auto-detects status-based field names and counts correctly
 * - Handles explicit field:value format
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatCard } from '../StatCard';
import { EventBusProvider } from '../../../providers/EventBusProvider';

// Create a test wrapper with QueryClientProvider and EventBusProvider
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <EventBusProvider>
        {children}
      </EventBusProvider>
    </QueryClientProvider>
  );
}

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestWrapper });
}

describe('StatCard', () => {
  describe('single metric', () => {
    it('renders label and value for single metric', () => {
      renderWithProviders(
        <StatCard
          label="Total Items"
          value={42}
        />
      );

      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('calculates count from data with "count" field', () => {
      const data = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];

      renderWithProviders(
        <StatCard
          metrics={[{ field: 'count', label: 'Total' }]}
          entity={data}
        />
      );

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('sums numeric field values', () => {
      const data = [
        { id: '1', amount: 100 },
        { id: '2', amount: 200 },
        { id: '3', amount: 50 },
      ];

      renderWithProviders(
        <StatCard
          metrics={[{ field: 'amount', label: 'Total Amount' }]}
          entity={data}
        />
      );

      expect(screen.getByText('Total Amount')).toBeInTheDocument();
      expect(screen.getByText('350')).toBeInTheDocument();
    });
  });

  describe('explicit field:value format', () => {
    it('counts items matching field:value pattern', () => {
      const data = [
        { id: '1', status: 'active' },
        { id: '2', status: 'active' },
        { id: '3', status: 'inactive' },
      ];

      renderWithProviders(
        <StatCard
          metrics={[{ field: 'status:active', label: 'Active' }]}
          entity={data}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('auto-detect status-based field names', () => {
    it('counts items where status field matches metric field name', () => {
      const data = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'processing' },
        { id: '4', status: 'shipped' },
      ];

      renderWithProviders(
        <StatCard
          metrics={[{ field: 'pending', label: 'Pending Orders' }]}
          entity={data}
        />
      );

      expect(screen.getByText('Pending Orders')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('handles "state" field for status detection', () => {
      const data = [
        { id: '1', state: 'open' },
        { id: '2', state: 'open' },
        { id: '3', state: 'closed' },
      ];

      renderWithProviders(
        <StatCard
          metrics={[{ field: 'open', label: 'Open Items' }]}
          entity={data}
        />
      );

      expect(screen.getByText('Open Items')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('handles "phase" field for status detection', () => {
      const data = [
        { id: '1', phase: 'planning' },
        { id: '2', phase: 'planning' },
        { id: '3', phase: 'execution' },
      ];

      renderWithProviders(
        <StatCard
          metrics={[{ field: 'planning', label: 'Planning Phase' }]}
          entity={data}
        />
      );

      expect(screen.getByText('Planning Phase')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('returns 0 for status value with no matches', () => {
      const data = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'processing' },
      ];

      renderWithProviders(
        <StatCard
          metrics={[{ field: 'shipped', label: 'Shipped' }]}
          entity={data}
        />
      );

      expect(screen.getByText('Shipped')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('multiple metrics', () => {
    it('renders ALL metrics as separate cards, not just the first one', () => {
      const data = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'processing' },
        { id: '4', status: 'shipped' },
      ];

      renderWithProviders(
        <StatCard
          metrics={[
            { field: 'pending', label: 'Pending' },
            { field: 'processing', label: 'Processing' },
            { field: 'shipped', label: 'Shipped' },
          ]}
          entity={data}
        />
      );

      // All labels should be rendered
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Shipped')).toBeInTheDocument();

      // All values should be correct
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 pending
      // Both processing and shipped have 1 item each
      const onesElements = screen.getAllByText('1');
      expect(onesElements.length).toBe(2); // 1 processing + 1 shipped
    });

    it('renders grid layout for multiple metrics', () => {
      const data = [
        { id: '1', status: 'active' },
        { id: '2', status: 'inactive' },
      ];

      const { container } = renderWithProviders(
        <StatCard
          metrics={[
            { field: 'active', label: 'Active' },
            { field: 'inactive', label: 'Inactive' },
          ]}
          entity={data}
        />
      );

      // Should render a grid container for multiple metrics
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('empty data handling', () => {
    it('shows 0 for all status metrics when data is empty', () => {
      renderWithProviders(
        <StatCard
          metrics={[
            { field: 'pending', label: 'Pending' },
            { field: 'processing', label: 'Processing' },
          ]}
          entity={[]}
        />
      );

      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      // Both should show 0
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(2);
    });
  });

  describe('loading state', () => {
    it('shows loading skeleton for single metric', () => {
      const { container } = renderWithProviders(
        <StatCard
          label="Loading"
          isLoading={true}
        />
      );

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows loading skeleton for multiple metrics', () => {
      const { container } = renderWithProviders(
        <StatCard
          metrics={[
            { field: 'pending', label: 'Pending' },
            { field: 'processing', label: 'Processing' },
          ]}
          entity={[]}
          isLoading={true}
        />
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Order entity scenario (regression test)', () => {
    it('correctly counts Order statuses from metrics like pending/processing/shipped', () => {
      // This is the exact scenario that was broken:
      // OrderListUI uses StatCard with metrics: [{field: "pending"}, {field: "processing"}, {field: "shipped"}]
      // Order entity has a "status" field with values like "pending", "processing", "shipped"
      const orderData = [
        { id: '1', orderNumber: 'ORD-001', status: 'pending', total: 100 },
        { id: '2', orderNumber: 'ORD-002', status: 'pending', total: 200 },
        { id: '3', orderNumber: 'ORD-003', status: 'pending', total: 150 },
        { id: '4', orderNumber: 'ORD-004', status: 'processing', total: 300 },
        { id: '5', orderNumber: 'ORD-005', status: 'processing', total: 250 },
        { id: '6', orderNumber: 'ORD-006', status: 'shipped', total: 175 },
      ];

      renderWithProviders(
        <StatCard
          entity={orderData}
          metrics={[
            { field: 'pending', label: 'Pending', format: 'number' },
            { field: 'processing', label: 'Processing', format: 'number' },
            { field: 'shipped', label: 'Shipped', format: 'number' },
          ]}
        />
      );

      // All labels should be visible
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Shipped')).toBeInTheDocument();

      // Values should be correct counts
      expect(screen.getByText('3')).toBeInTheDocument(); // 3 pending
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 processing
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 shipped
    });
  });
});
