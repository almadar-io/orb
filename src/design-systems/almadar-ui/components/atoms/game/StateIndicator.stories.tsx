import type { Meta, StoryObj } from '@storybook/react';
import { StateIndicator } from './StateIndicator';
import { HStack, VStack } from '../Stack';

const meta: Meta<typeof StateIndicator> = {
    title: 'Atoms/Game/StateIndicator',
    component: StateIndicator,
};
export default meta;
type Story = StoryObj<typeof StateIndicator>;

export const Default: Story = {
    args: { state: 'idle' },
};

export const Active: Story = {
    args: { state: 'active' },
};

export const Sleeping: Story = {
    args: { state: 'sleeping' },
};

export const AllStates: Story = {
    render: () => (
        <VStack gap="sm">
            <HStack gap="sm" className="flex-wrap">
                {['idle', 'active', 'sleeping', 'moving', 'eating', 'waiting', 'happy', 'scared', 'done', 'error', 'ready', 'cooldown'].map(s => (
                    <StateIndicator key={s} state={s} />
                ))}
            </HStack>
        </VStack>
    ),
};

export const CustomStyles: Story = {
    render: () => (
        <HStack gap="sm">
            <StateIndicator
                state="sniffing"
                stateStyles={{ sniffing: { icon: '\uD83D\uDC3E', bgClass: 'bg-warning' } }}
            />
            <StateIndicator
                state="hooting"
                stateStyles={{ hooting: { icon: '\uD83E\uDD89', bgClass: 'bg-info' } }}
            />
        </HStack>
    ),
};

export const Sizes: Story = {
    render: () => (
        <HStack gap="md" className="items-center">
            <StateIndicator state="active" size="sm" />
            <StateIndicator state="active" size="md" />
            <StateIndicator state="active" size="lg" />
        </HStack>
    ),
};
