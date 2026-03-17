import type { Meta, StoryObj } from '@storybook/react-vite';
import { WizardContainer, type WizardStep } from './WizardContainer';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { Input } from '../atoms/Input';

const meta: Meta<typeof WizardContainer> = {
    title: 'Organisms/WizardContainer',
    component: WizardContainer,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const Step1 = () => (
    <Box>
        <Typography variant="body1" className="mb-4">
            Welcome to the setup wizard. Let's get started by entering your basic information.
        </Typography>
        <div className="space-y-4">
            <div>
                <Typography variant="small" weight="semibold" className="mb-1 block">Name</Typography>
                <Input placeholder="Enter your name" />
            </div>
            <div>
                <Typography variant="small" weight="semibold" className="mb-1 block">Email</Typography>
                <Input type="email" placeholder="Enter your email" />
            </div>
        </div>
    </Box>
);

const Step2 = () => (
    <Box>
        <Typography variant="body1" className="mb-4">
            Now let's configure your preferences.
        </Typography>
        <div className="space-y-4">
            <div>
                <Typography variant="small" weight="semibold" className="mb-1 block">Theme</Typography>
                <select className="w-full border-2 border-black p-2">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                </select>
            </div>
            <div>
                <Typography variant="small" weight="semibold" className="mb-1 block">Language</Typography>
                <select className="w-full border-2 border-black p-2">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                </select>
            </div>
        </div>
    </Box>
);

const Step3 = () => (
    <Box className="text-center py-8">
        <Typography variant="h3" className="mb-4">All Done!</Typography>
        <Typography variant="body1" className="text-neutral-600">
            Your account has been set up successfully. Click "Complete" to finish.
        </Typography>
    </Box>
);

const sampleSteps: WizardStep[] = [
    {
        id: 'info',
        title: 'Basic Information',
        description: 'Enter your personal details',
        content: <Step1 />,
    },
    {
        id: 'preferences',
        title: 'Preferences',
        description: 'Configure your settings',
        content: <Step2 />,
    },
    {
        id: 'complete',
        title: 'Complete',
        description: 'Review and finish',
        content: <Step3 />,
    },
];

export const Default: Story = {
    args: {
        steps: sampleSteps,
        showProgress: true,
        allowBack: true,
        onComplete: () => console.log('Wizard completed!'),
    },
    decorators: [
        (Story) => (
            <div style={{ height: '600px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const NoProgress: Story = {
    args: {
        steps: sampleSteps,
        showProgress: false,
        allowBack: true,
    },
    decorators: [
        (Story) => (
            <div style={{ height: '500px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const NoBackNavigation: Story = {
    args: {
        steps: sampleSteps,
        showProgress: true,
        allowBack: false,
    },
    decorators: [
        (Story) => (
            <div style={{ height: '600px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const CompactMode: Story = {
    args: {
        steps: sampleSteps,
        showProgress: true,
        allowBack: true,
        compact: true,
    },
    decorators: [
        (Story) => (
            <div style={{ height: '400px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const SecondStep: Story = {
    args: {
        steps: sampleSteps,
        currentStep: 1,
        showProgress: true,
        allowBack: true,
    },
    decorators: [
        (Story) => (
            <div style={{ height: '600px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};
