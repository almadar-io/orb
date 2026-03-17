import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitPane } from './SplitPane';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';

const meta: Meta<typeof SplitPane> = {
    title: 'Organisms/Layout/SplitPane',
    component: SplitPane,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const LeftPane = () => (
    <Box className="h-full p-4 bg-neutral-100">
        <Typography variant="h4">Left Pane</Typography>
        <Typography variant="body2" className="mt-2 text-neutral-600">
            This is the left/top content area. Drag the handle to resize.
        </Typography>
    </Box>
);

const RightPane = () => (
    <Box className="h-full p-4">
        <Typography variant="h4">Right Pane</Typography>
        <Typography variant="body2" className="mt-2 text-neutral-600">
            This is the right/bottom content area.
        </Typography>
    </Box>
);

export const Default: Story = {
    args: {
        left: <LeftPane />,
        right: <RightPane />,
        ratio: 50,
        resizable: true,
    },
    decorators: [
        (Story) => (
            <div style={{ height: '400px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const HorizontalThirds: Story = {
    args: {
        left: <LeftPane />,
        right: <RightPane />,
        ratio: 33,
        direction: 'horizontal',
    },
    decorators: [
        (Story) => (
            <div style={{ height: '400px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const Vertical: Story = {
    args: {
        left: <LeftPane />,
        right: <RightPane />,
        direction: 'vertical',
        ratio: 40,
    },
    decorators: [
        (Story) => (
            <div style={{ height: '600px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const NonResizable: Story = {
    args: {
        left: <LeftPane />,
        right: <RightPane />,
        ratio: 30,
        resizable: false,
    },
    decorators: [
        (Story) => (
            <div style={{ height: '400px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const CodePreview: Story = {
    args: {
        left: (
            <Box className="h-full p-4 bg-neutral-900 text-white font-mono">
                <Typography variant="small" className="text-green-400">// Editor</Typography>
                <pre className="mt-2 text-sm">
                    {`function hello() {
  return "Hello, World!";
}`}
                </pre>
            </Box>
        ),
        right: (
            <Box className="h-full p-4 flex items-center justify-center">
                <Typography variant="h3">Preview: Hello, World!</Typography>
            </Box>
        ),
        ratio: 50,
    },
    decorators: [
        (Story) => (
            <div style={{ height: '400px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};
