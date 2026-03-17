import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ErrorBoundary } from './ErrorBoundary';
import { Alert } from './Alert';

// Helper that throws on render
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Component crashed unexpectedly');
  }
  return <div className="p-4 bg-green-50 rounded border border-green-200">Component is working fine.</div>;
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Molecules/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-96">
      <ErrorBoundary>
        <BuggyComponent shouldThrow />
      </ErrorBoundary>
    </div>
  ),
};

export const NoError: Story = {
  render: () => (
    <div className="w-96">
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>
    </div>
  ),
};

export const CustomFallbackNode: Story = {
  render: () => (
    <div className="w-96">
      <ErrorBoundary fallback={<Alert variant="error" title="Crash">This component crashed.</Alert>}>
        <BuggyComponent shouldThrow />
      </ErrorBoundary>
    </div>
  ),
};

export const RenderFunctionFallback: Story = {
  render: () => (
    <div className="w-96">
      <ErrorBoundary
        fallback={(error, reset) => (
          <div className="p-4 border border-red-300 rounded bg-red-50 space-y-2">
            <p className="text-red-700 font-medium">Caught: {error.message}</p>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              onClick={reset}
            >
              Reset
            </button>
          </div>
        )}
      >
        <BuggyComponent shouldThrow />
      </ErrorBoundary>
    </div>
  ),
};

export const WithErrorCallback: Story = {
  render: () => (
    <div className="w-96">
      <ErrorBoundary
        onError={(error, info) => console.log('[ErrorBoundary]', error.message, info.componentStack)}
      >
        <BuggyComponent shouldThrow />
      </ErrorBoundary>
    </div>
  ),
};
