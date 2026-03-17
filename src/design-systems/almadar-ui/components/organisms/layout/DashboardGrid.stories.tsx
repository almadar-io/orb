import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardGrid } from './DashboardGrid';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';

const meta: Meta<typeof DashboardGrid> = {
    title: 'Organisms/Layout/DashboardGrid',
    component: DashboardGrid,
    parameters: {
        layout: 'padded',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const StatCell = ({ label, value }: { label: string; value: string }) => (
    <Box className="p-4">
        <Typography variant="caption" className="text-neutral-500">{label}</Typography>
        <Typography variant="h3">{value}</Typography>
    </Box>
);

const ActivityFeed = () => (
    <Box className="p-4 h-full">
        <Typography variant="h5" className="mb-4">Activity Feed</Typography>
        {[1, 2, 3, 4].map((i) => (
            <Box key={i} className="py-2 border-b border-neutral-200 last:border-b-0">
                <Typography variant="small">Event {i} happened just now</Typography>
            </Box>
        ))}
    </Box>
);

const QuickActions = () => (
    <Box className="p-4">
        <Typography variant="h5" className="mb-4">Quick Actions</Typography>
        <div className="space-y-2">
            <button className="w-full py-2 px-4 border-2 border-black hover:bg-black hover:text-white transition-colors">
                New Item
            </button>
            <button className="w-full py-2 px-4 border-2 border-black hover:bg-black hover:text-white transition-colors">
                Export Data
            </button>
        </div>
    </Box>
);

export const Default: Story = {
    args: {
        columns: 3,
        gap: 'md',
        cells: [
            { id: 'stat-1', content: <StatCell label="Total Users" value="2,543" /> },
            { id: 'stat-2', content: <StatCell label="Revenue" value="$45,231" /> },
            { id: 'stat-3', content: <StatCell label="Orders" value="156" /> },
            { id: 'activity', content: <ActivityFeed />, colSpan: 2, rowSpan: 2 },
            { id: 'actions', content: <QuickActions /> },
        ],
    },
};

export const TwoColumns: Story = {
    args: {
        columns: 2,
        gap: 'lg',
        cells: [
            { id: 'stat-1', content: <StatCell label="Total Users" value="2,543" /> },
            { id: 'stat-2', content: <StatCell label="Revenue" value="$45,231" /> },
            { id: 'wide', content: <ActivityFeed />, colSpan: 2 },
        ],
    },
};

export const FourColumns: Story = {
    args: {
        columns: 4,
        gap: 'sm',
        cells: [
            { id: 'stat-1', content: <StatCell label="Users" value="2,543" /> },
            { id: 'stat-2', content: <StatCell label="Revenue" value="$45K" /> },
            { id: 'stat-3', content: <StatCell label="Orders" value="156" /> },
            { id: 'stat-4', content: <StatCell label="Rate" value="12.5%" /> },
        ],
    },
};

export const MixedSpanning: Story = {
    args: {
        columns: 4,
        gap: 'md',
        cells: [
            { id: 'wide', content: <StatCell label="Main Metric" value="$1.2M" />, colSpan: 2 },
            { id: 'stat-1', content: <StatCell label="Metric A" value="234" /> },
            { id: 'stat-2', content: <StatCell label="Metric B" value="567" /> },
            { id: 'tall', content: <ActivityFeed />, colSpan: 3, rowSpan: 2 },
            { id: 'actions', content: <QuickActions />, rowSpan: 2 },
        ],
    },
};
