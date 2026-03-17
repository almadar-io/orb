import type { Meta, StoryObj } from '@storybook/react';
import { StateMachineView } from './StateMachineView';
import { renderStateMachineToDomData, DEFAULT_CONFIG } from '../../lib/visualizer/index.js';

const meta: Meta<typeof StateMachineView> = {
  title: 'Organisms/StateMachineView',
  component: StateMachineView,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0d1117' }] },
  },
};

export default meta;
type Story = StoryObj<typeof StateMachineView>;

// ---------------------------------------------------------------------------
// Sample layout data
// ---------------------------------------------------------------------------

const simpleLayout = renderStateMachineToDomData(
  {
    states: [
      { name: 'idle', isInitial: true },
      { name: 'running' },
      { name: 'done', isFinal: true },
    ],
    transitions: [
      { from: 'idle', to: 'running', event: 'START' },
      { from: 'running', to: 'done', event: 'FINISH' },
    ],
  },
  { title: 'Simple Flow' },
  DEFAULT_CONFIG,
);

const complexLayout = renderStateMachineToDomData(
  {
    states: [
      { name: 'pending', isInitial: true },
      { name: 'confirmed' },
      { name: 'processing' },
      { name: 'shipped' },
      { name: 'delivered', isFinal: true },
      { name: 'cancelled', isFinal: true },
    ],
    transitions: [
      { from: 'pending', to: 'confirmed', event: 'CONFIRM', guard: ['>', '@entity.total', 0] },
      { from: 'confirmed', to: 'processing', event: 'PROCESS', effects: [['set', '@entity.status', 'processing']] },
      { from: 'processing', to: 'shipped', event: 'SHIP' },
      { from: 'shipped', to: 'delivered', event: 'DELIVER' },
      { from: 'pending', to: 'cancelled', event: 'CANCEL' },
      { from: 'confirmed', to: 'cancelled', event: 'CANCEL' },
    ],
  },
  { title: 'Order Processing' },
  DEFAULT_CONFIG,
);

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Simple: Story = {
  args: {
    layoutData: simpleLayout,
  },
};

export const Complex: Story = {
  args: {
    layoutData: complexLayout,
  },
};
