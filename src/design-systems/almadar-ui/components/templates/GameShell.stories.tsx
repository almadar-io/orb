import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { GameShell } from './GameShell';
import { Typography } from '../atoms/Typography';
import { Box } from '../atoms/Box';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const meta: Meta<typeof GameShell> = {
    title: 'Templates/GameShell',
    component: GameShell,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MemoryRouter>
                <Routes>
                    <Route element={<Story />}>
                        <Route
                            index
                            element={
                                <Box
                                    display="flex"
                                    className="items-center justify-center h-full"
                                    style={{ background: 'var(--color-muted, #1a1a2e)' }}
                                >
                                    <Typography color="muted">Game Content Area</Typography>
                                </Box>
                            }
                        />
                    </Route>
                </Routes>
            </MemoryRouter>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        appName: 'Trait Wars',
    },
};

export const WithHUD: Story = {
    args: {
        appName: 'Strategy Game',
        hud: (
            <Typography variant="small" color="muted">Gold: 500 | Army: 12</Typography>
        ),
    },
};

export const NoTopBar: Story = {
    args: {
        appName: 'Fullscreen Game',
        showTopBar: false,
    },
};

export const CustomName: Story = {
    args: {
        appName: 'Super Platform Quest',
    },
};
