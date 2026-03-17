import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Box, Typography, Button } from '../../atoms';
import { HStack, VStack } from '../../atoms/Stack';
import { GameAudioProvider } from './GameAudioProvider';
import { GameAudioToggle } from './GameAudioToggle';
import { useGameAudioContext } from './GameAudioProvider';

/** Demo child that shows the current audio state */
// eslint-disable-next-line almadar/require-translate -- storybook-only, not a shipped component
function AudioStatusDemo(): React.JSX.Element {
    const { muted, masterVolume, setMasterVolume } = useGameAudioContext();
    return (
        <VStack gap="sm" className="p-4 border border-border rounded-lg bg-card">
            <HStack className="items-center justify-between">
                <Typography variant="body2" className="text-foreground">
                    {'Audio status:'}
                </Typography>
                <GameAudioToggle size="sm" />
            </HStack>
            <Typography variant="caption" className="text-muted-foreground">
                {muted ? 'Muted 🔇' : `Playing 🔊 — volume ${Math.round(masterVolume * 100)}%`}
            </Typography>
            <HStack gap="xs">
                <Button variant="ghost" size="sm" onClick={() => setMasterVolume(0.25)}>
                    {'25%'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setMasterVolume(0.5)}>
                    {'50%'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setMasterVolume(1)}>
                    {'100%'}
                </Button>
            </HStack>
        </VStack>
    );
}

AudioStatusDemo.displayName = 'AudioStatusDemo';

/** Minimal manifest for demo — no actual audio files served in Storybook */
const DEMO_MANIFEST = {};

const meta: Meta<typeof GameAudioProvider> = {
    title: 'Game/GameAudioProvider',
    component: GameAudioProvider,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
        docs: {
            description: {
                component: [
                    'Context provider that wires sound playback to the event bus.',
                    'Wrap your game organism with `<GameAudioProvider manifest={...}>` and emit',
                    '`UI:PLAY_SOUND` events from anywhere in the tree to trigger sounds.',
                ].join(' '),
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <GameAudioProvider manifest={DEMO_MANIFEST}>
            <Box className="p-6">
                <AudioStatusDemo />
            </Box>
        </GameAudioProvider>
    ),
};

export const InitiallyMuted: Story = {
    render: () => (
        <GameAudioProvider manifest={DEMO_MANIFEST} initialMuted>
            <Box className="p-6">
                <AudioStatusDemo />
            </Box>
        </GameAudioProvider>
    ),
};
