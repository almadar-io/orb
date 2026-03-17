import type { Meta, StoryObj } from '@storybook/react-vite';
import { Meter } from './Meter';

const meta: Meta<typeof Meter> = {
    title: 'Organisms/Meter',
    component: Meter,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Linear: Story = {
    args: {
        label: 'Storage Usage',
        value: 72,
        max: 100,
        unit: 'GB',
        variant: 'linear',
    },
};

export const LinearWithThresholds: Story = {
    args: {
        label: 'CPU Temperature',
        value: 68,
        max: 100,
        unit: '°C',
        variant: 'linear',
        thresholds: [
            { value: 50, color: '#22c55e', label: 'Normal' },
            { value: 75, color: '#eab308', label: 'Warning' },
            { value: 90, color: '#ef4444', label: 'Critical' },
        ],
    },
};

export const RadialSmall: Story = {
    args: {
        label: 'Battery',
        value: 85,
        max: 100,
        unit: '%',
        variant: 'radial',
        size: 'sm',
        thresholds: [
            { value: 20, color: '#ef4444' },
            { value: 50, color: '#eab308' },
            { value: 80, color: '#22c55e' },
        ],
    },
};

export const RadialMedium: Story = {
    args: {
        label: 'Performance Score',
        value: 750,
        min: 0,
        max: 1000,
        variant: 'radial',
        size: 'md',
        thresholds: [
            { value: 300, color: '#ef4444', label: 'Poor' },
            { value: 600, color: '#eab308', label: 'Fair' },
            { value: 800, color: '#22c55e', label: 'Good' },
        ],
    },
};

export const RadialLarge: Story = {
    args: {
        label: 'Disk I/O',
        value: 450,
        min: 0,
        max: 1000,
        unit: 'MB/s',
        variant: 'radial',
        size: 'lg',
    },
};

export const Segmented: Story = {
    args: {
        label: 'Signal Strength',
        value: 3,
        min: 0,
        max: 5,
        variant: 'segmented',
        segments: 5,
        thresholds: [
            { value: 1, color: '#ef4444' },
            { value: 3, color: '#eab308' },
            { value: 4, color: '#22c55e' },
        ],
    },
};

export const Loading: Story = {
    args: {
        label: 'Loading...',
        value: 0,
        isLoading: true,
    },
};

export const MeterDashboard: Story = {
    render: () => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-[800px]">
            <Meter label="CPU" value={65} unit="%" variant="radial" size="sm"
                thresholds={[{ value: 50, color: '#22c55e' }, { value: 80, color: '#eab308' }, { value: 95, color: '#ef4444' }]} />
            <Meter label="Memory" value={82} unit="%" variant="radial" size="sm"
                thresholds={[{ value: 50, color: '#22c55e' }, { value: 80, color: '#eab308' }, { value: 95, color: '#ef4444' }]} />
            <Meter label="Disk" value={45} unit="%" variant="radial" size="sm"
                thresholds={[{ value: 50, color: '#22c55e' }, { value: 80, color: '#eab308' }, { value: 95, color: '#ef4444' }]} />
            <Meter label="Network" value={30} unit="%" variant="radial" size="sm"
                thresholds={[{ value: 50, color: '#22c55e' }, { value: 80, color: '#eab308' }, { value: 95, color: '#ef4444' }]} />
        </div>
    ),
};
