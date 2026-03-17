import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameTemplate } from './GameTemplate';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Box } from '../atoms/Box';
import { VStack } from '../atoms/Stack';
import { HStack } from '../atoms/Stack';

const meta: Meta<typeof GameTemplate> = {
    title: 'Templates/GameTemplate',
    component: GameTemplate,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Super Platform Quest',
        children: (
            <Box className="h-[400px] bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-300">
                <Typography color="secondary">Game Canvas</Typography>
            </Box>
        ),
    },
};

export const WithControls: Story = {
    args: {
        title: 'Platformer Game',
        controls: {
            isPlaying: false,
            onPlay: () => console.log('Play'),
            onPause: () => console.log('Pause'),
            onReset: () => console.log('Reset'),
        },
        children: (
            <Box className="h-[400px] bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-300">
                <Typography color="secondary">Click Play to start</Typography>
            </Box>
        ),
    },
};

export const Playing: Story = {
    args: {
        title: 'Platformer Game',
        controls: {
            isPlaying: true,
            onPlay: () => console.log('Play'),
            onPause: () => console.log('Pause'),
            onReset: () => console.log('Reset'),
        },
        children: (
            <Box className="h-[400px] bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-300">
                <Typography color="secondary">Game Running...</Typography>
            </Box>
        ),
    },
};

export const WithHUD: Story = {
    args: {
        title: 'Adventure Game',
        controls: {
            isPlaying: true,
            onPlay: () => console.log('Play'),
            onPause: () => console.log('Pause'),
            onReset: () => console.log('Reset'),
        },
        hud: (
            <Box className="bg-white border-2 border-black p-2 shadow-wireframe">
                <HStack gap="lg">
                    <Box>
                        <Typography variant="caption" color="secondary">SCORE</Typography>
                        <Typography variant="h6">12,500</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="secondary">HEALTH</Typography>
                        <HStack gap="xs">
                            <Typography className="text-red-500">&#10084;&#65039;</Typography>
                            <Typography className="text-red-500">&#10084;&#65039;</Typography>
                            <Typography className="text-neutral-300">&#10084;&#65039;</Typography>
                        </HStack>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="secondary">LEVEL</Typography>
                        <Typography variant="h6">3</Typography>
                    </Box>
                </HStack>
            </Box>
        ),
        children: (
            <Box className="h-[400px] bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-300">
                <Typography color="secondary">Game Canvas with HUD Overlay</Typography>
            </Box>
        ),
    },
};

export const WithDebugPanel: Story = {
    args: {
        title: 'Debug Mode',
        showDebugPanel: true,
        controls: {
            isPlaying: true,
            onPlay: () => console.log('Play'),
            onPause: () => console.log('Pause'),
            onReset: () => console.log('Reset'),
        },
        debugPanel: (
            <VStack gap="md">
                <Box>
                    <Typography variant="caption" color="secondary">Entity: Player</Typography>
                    <VStack gap="xs" className="font-mono text-xs mt-1">
                        <Typography variant="caption">x: 150</Typography>
                        <Typography variant="caption">y: 320</Typography>
                        <Typography variant="caption">health: 100</Typography>
                        <Typography variant="caption">score: 12500</Typography>
                    </VStack>
                </Box>
                <Box>
                    <Typography variant="caption" color="secondary">State Machine</Typography>
                    <Box className="mt-1">
                        <Badge variant="info">idle</Badge>
                    </Box>
                </Box>
                <Box>
                    <Typography variant="caption" color="secondary">FPS</Typography>
                    <Typography variant="body1" className="font-mono">60</Typography>
                </Box>
            </VStack>
        ),
        children: (
            <Box className="h-[400px] bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-300">
                <Typography color="secondary">Game Canvas</Typography>
            </Box>
        ),
    },
};

export const FullFeatured: Story = {
    args: {
        title: 'Super Platform Quest',
        showDebugPanel: true,
        controls: {
            isPlaying: true,
            onPlay: () => console.log('Play'),
            onPause: () => console.log('Pause'),
            onReset: () => console.log('Reset'),
        },
        hud: (
            <Box className="bg-white border-2 border-black p-3 shadow-wireframe">
                <HStack gap="xl">
                    <Box>
                        <Typography variant="caption" color="secondary">SCORE</Typography>
                        <Typography variant="h5">25,000</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="secondary">LIVES</Typography>
                        <Typography variant="h5">3</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="secondary">COINS</Typography>
                        <Typography variant="h5">47</Typography>
                    </Box>
                </HStack>
            </Box>
        ),
        debugPanel: (
            <VStack gap="md" className="text-sm">
                <Box>
                    <Typography variant="caption" color="secondary" className="font-bold">Player</Typography>
                    <VStack gap="xs" className="font-mono text-xs mt-1">
                        <HStack justify="between"><Typography variant="caption">position:</Typography><Typography variant="caption">(256, 384)</Typography></HStack>
                        <HStack justify="between"><Typography variant="caption">velocity:</Typography><Typography variant="caption">(2.5, 0)</Typography></HStack>
                        <HStack justify="between"><Typography variant="caption">grounded:</Typography><Typography variant="caption">true</Typography></HStack>
                    </VStack>
                </Box>
                <Box>
                    <Typography variant="caption" color="secondary" className="font-bold">State</Typography>
                    <Badge variant="success" className="mt-1">running</Badge>
                </Box>
                <Box>
                    <Typography variant="caption" color="secondary" className="font-bold">Performance</Typography>
                    <VStack gap="xs" className="font-mono text-xs mt-1">
                        <HStack justify="between"><Typography variant="caption">FPS:</Typography><Typography variant="caption">60</Typography></HStack>
                        <HStack justify="between"><Typography variant="caption">Entities:</Typography><Typography variant="caption">24</Typography></HStack>
                        <HStack justify="between"><Typography variant="caption">Tick:</Typography><Typography variant="caption">1847</Typography></HStack>
                    </VStack>
                </Box>
            </VStack>
        ),
        children: (
            <Box className="h-[400px] bg-gradient-to-b from-sky-100 to-sky-200 flex items-end justify-center border-2 border-dashed border-neutral-300">
                <VStack align="center" className="mb-8">
                    <Box className="w-8 h-12 bg-blue-500 border-2 border-black mb-2" />
                    <Typography color="secondary">Game Running</Typography>
                </VStack>
            </Box>
        ),
    },
};
