import type { Meta, StoryObj } from '@storybook/react-vite';
import { MasterDetail } from './MasterDetail';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { useState } from 'react';

const meta: Meta<typeof MasterDetail> = {
    title: 'Organisms/Layout/MasterDetail',
    component: MasterDetail,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
    { id: '1', title: 'Item 1', description: 'First item description' },
    { id: '2', title: 'Item 2', description: 'Second item description' },
    { id: '3', title: 'Item 3', description: 'Third item description' },
    { id: '4', title: 'Item 4', description: 'Fourth item description' },
];

const MasterList = ({ selectedId, onSelect }: { selectedId?: string; onSelect: (id: string) => void }) => (
    <Box className="h-full">
        <Box paddingX="md" paddingY="sm" border className="border-b-2 border-x-0 border-t-0 border-black">
            <Typography variant="h5">Items</Typography>
        </Box>
        <div>
            {sampleItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full text-left px-4 py-3 border-b-2 border-black transition-colors ${selectedId === item.id ? 'bg-black text-white' : 'hover:bg-neutral-100'
                        }`}
                >
                    <Typography variant="body1" weight="semibold">{item.title}</Typography>
                    <Typography variant="caption" className={selectedId === item.id ? 'text-neutral-300' : 'text-neutral-500'}>
                        {item.description}
                    </Typography>
                </button>
            ))}
        </div>
    </Box>
);

const DetailView = ({ item }: { item: typeof sampleItems[0] }) => (
    <Box className="p-6">
        <Typography variant="h3">{item.title}</Typography>
        <Typography variant="body1" className="mt-4 text-neutral-600">
            {item.description}
        </Typography>
        <Typography variant="body2" className="mt-4">
            This is the detail view for the selected item. In a real application, this would show comprehensive information about the item.
        </Typography>
    </Box>
);

const InteractiveExample = () => {
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const selectedItem = sampleItems.find(item => item.id === selectedId);

    return (
        <MasterDetail
            master={<MasterList selectedId={selectedId} onSelect={setSelectedId} />}
            detail={selectedItem && <DetailView item={selectedItem} />}
            hasSelection={!!selectedItem}
            masterWidth="300px"
        />
    );
};

export const Default: Story = {
    render: () => <InteractiveExample />,
    decorators: [
        (Story) => (
            <div style={{ height: '500px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const WithSelection: Story = {
    args: {
        master: <MasterList selectedId="1" onSelect={() => { }} />,
        detail: <DetailView item={sampleItems[0]} />,
        hasSelection: true,
        masterWidth: '350px',
    },
    decorators: [
        (Story) => (
            <div style={{ height: '500px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const NoSelection: Story = {
    args: {
        master: <MasterList selectedId={undefined} onSelect={() => { }} />,
        detail: null,
        hasSelection: false,
        masterWidth: '300px',
    },
    decorators: [
        (Story) => (
            <div style={{ height: '500px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const WidePanel: Story = {
    args: {
        master: <MasterList selectedId="2" onSelect={() => { }} />,
        detail: <DetailView item={sampleItems[1]} />,
        hasSelection: true,
        masterWidth: '40%',
    },
    decorators: [
        (Story) => (
            <div style={{ height: '500px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};
