import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignaturePad } from './SignaturePad';

const meta: Meta<typeof SignaturePad> = {
    title: 'Organisms/SignaturePad',
    component: SignaturePad,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Your Signature',
        helperText: 'Sign in the box above, then press Confirm',
    },
};

export const CustomStyle: Story = {
    args: {
        label: 'Sign Here',
        strokeColor: '#1d4ed8',
        strokeWidth: 3,
        height: 200,
        helperText: 'Use mouse or touch to sign',
    },
};

export const ReadOnly: Story = {
    args: {
        label: 'Signature on File',
        readOnly: true,
        helperText: 'This signature is locked and cannot be modified',
    },
};

export const WithCustomEvents: Story = {
    args: {
        label: 'Approval Signature',
        helperText: 'By signing, you approve this document',
        signEvent: 'APPROVE_DOCUMENT',
        clearEvent: 'REVOKE_APPROVAL',
    },
};

export const Compact: Story = {
    args: {
        label: 'Quick Sign',
        height: 100,
        strokeWidth: 1,
    },
};

export const Loading: Story = {
    args: {
        label: 'Signature',
        isLoading: true,
    },
};
