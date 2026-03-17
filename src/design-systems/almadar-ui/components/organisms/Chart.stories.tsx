import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chart } from './Chart';

const meta: Meta<typeof Chart> = {
    title: 'Organisms/Chart',
    component: Chart,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BarChart: Story = {
    args: {
        title: 'Monthly Revenue',
        subtitle: 'Q4 2025',
        chartType: 'bar',
        series: [
            {
                name: 'Revenue',
                data: [
                    { label: 'Oct', value: 42000 },
                    { label: 'Nov', value: 51000 },
                    { label: 'Dec', value: 67000 },
                ],
                color: 'var(--color-primary)',
            },
        ],
        showValues: true,
        height: 300,
    },
};

export const LineChart: Story = {
    args: {
        title: 'User Growth',
        chartType: 'line',
        series: [
            {
                name: 'Users',
                data: [
                    { label: 'Jan', value: 100 },
                    { label: 'Feb', value: 250 },
                    { label: 'Mar', value: 400 },
                    { label: 'Apr', value: 520 },
                    { label: 'May', value: 700 },
                    { label: 'Jun', value: 950 },
                ],
                color: '#3b82f6',
            },
        ],
        height: 300,
    },
};

export const PieChart: Story = {
    args: {
        title: 'Traffic Sources',
        chartType: 'pie',
        series: [
            {
                name: 'Sources',
                data: [
                    { label: 'Organic', value: 45 },
                    { label: 'Direct', value: 25 },
                    { label: 'Social', value: 20 },
                    { label: 'Referral', value: 10 },
                ],
            },
        ],
        showLegend: true,
        height: 300,
    },
};

export const AreaChart: Story = {
    args: {
        title: 'CPU Usage',
        subtitle: 'Last 24 hours',
        chartType: 'area',
        series: [
            {
                name: 'CPU',
                data: [
                    { label: '00:00', value: 20 },
                    { label: '04:00', value: 15 },
                    { label: '08:00', value: 55 },
                    { label: '12:00', value: 72 },
                    { label: '16:00', value: 65 },
                    { label: '20:00', value: 30 },
                ],
                color: '#10b981',
            },
        ],
        height: 250,
    },
};

export const DonutChart: Story = {
    args: {
        title: 'Budget Allocation',
        chartType: 'donut',
        series: [
            {
                name: 'Budget',
                data: [
                    { label: 'Engineering', value: 40 },
                    { label: 'Marketing', value: 25 },
                    { label: 'Sales', value: 20 },
                    { label: 'Support', value: 15 },
                ],
            },
        ],
        showLegend: true,
        height: 300,
    },
};

export const MultiSeries: Story = {
    args: {
        title: 'Sales vs Expenses',
        chartType: 'bar',
        series: [
            {
                name: 'Sales',
                data: [
                    { label: 'Q1', value: 120 },
                    { label: 'Q2', value: 150 },
                    { label: 'Q3', value: 180 },
                    { label: 'Q4', value: 200 },
                ],
                color: '#3b82f6',
            },
            {
                name: 'Expenses',
                data: [
                    { label: 'Q1', value: 80 },
                    { label: 'Q2', value: 95 },
                    { label: 'Q3', value: 110 },
                    { label: 'Q4', value: 120 },
                ],
                color: '#ef4444',
            },
        ],
        showLegend: true,
        showValues: true,
        height: 300,
    },
};

export const Loading: Story = {
    args: {
        title: 'Loading Chart',
        chartType: 'bar',
        isLoading: true,
        height: 300,
    },
};

export const WithActions: Story = {
    args: {
        title: 'Monthly Performance',
        chartType: 'bar',
        series: [
            {
                name: 'Performance',
                data: [
                    { label: 'Jan', value: 85 },
                    { label: 'Feb', value: 92 },
                    { label: 'Mar', value: 78 },
                ],
            },
        ],
        actions: [
            { label: 'Export', event: 'EXPORT_CHART' },
            { label: 'Refresh', event: 'REFRESH_DATA' },
        ],
        height: 300,
    },
};
