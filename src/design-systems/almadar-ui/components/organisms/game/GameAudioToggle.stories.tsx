import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { HStack, Box, Typography } from '../../atoms';
import { GameAudioToggle } from './GameAudioToggle';
import { GameAudioProvider } from './GameAudioProvider';

/** Minimal audio manifest for the story — no actual sound files needed */
const DEMO_MANIFEST = {};

const meta: Meta<typeof GameAudioToggle> = {
    title: 'Game/GameAudioToggle',
    component: GameAudioToggle,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    decorators: [
        (Story) => (
            <GameAudioProvider manifest={DEMO_MANIFEST}>
                <Story />
            </GameAudioProvider>
        ),
    ],
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { size: 'sm' },
};

export const Sizes: Story = {
    render: () => (
        <GameAudioProvider manifest={DEMO_MANIFEST}>
            <HStack gap="md" className="items-center">
                <Box className="flex flex-col items-center gap-1">
                    <GameAudioToggle size="sm" />
                    <Typography variant="caption" className="text-muted-foreground">sm</Typography>
                </Box>
                <Box className="flex flex-col items-center gap-1">
                    <GameAudioToggle size="md" />
                    <Typography variant="caption" className="text-muted-foreground">md</Typography>
                </Box>
                <Box className="flex flex-col items-center gap-1">
                    <GameAudioToggle size="lg" />
                    <Typography variant="caption" className="text-muted-foreground">lg</Typography>
                </Box>
            </HStack>
        </GameAudioProvider>
    ),
};

export const InHUD: Story = {
    render: () => (
        <GameAudioProvider manifest={DEMO_MANIFEST}>
            <Box className="flex items-center justify-between px-4 py-2 bg-background/80 border border-border rounded-lg w-64">
                <Typography variant="caption" className="text-muted-foreground">
                    {'3 puzzles solved'}
                </Typography>
                <GameAudioToggle size="sm" />
            </Box>
        </GameAudioProvider>
    ),
};
