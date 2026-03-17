import type { Meta, StoryObj } from '@storybook/react-vite';
import { MediaGallery } from './MediaGallery';

const meta: Meta<typeof MediaGallery> = {
    title: 'Organisms/MediaGallery',
    component: MediaGallery,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMedia = [
    { id: '1', src: 'https://picsum.photos/seed/a/400/300', alt: 'Landscape 1', caption: 'Mountain sunrise' },
    { id: '2', src: 'https://picsum.photos/seed/b/400/300', alt: 'Landscape 2', caption: 'Ocean view' },
    { id: '3', src: 'https://picsum.photos/seed/c/400/300', alt: 'Landscape 3', caption: 'Forest trail' },
    { id: '4', src: 'https://picsum.photos/seed/d/400/300', alt: 'Landscape 4', caption: 'Desert sunset' },
    { id: '5', src: 'https://picsum.photos/seed/e/400/300', alt: 'Landscape 5', caption: 'City skyline' },
    { id: '6', src: 'https://picsum.photos/seed/f/400/300', alt: 'Landscape 6', caption: 'Waterfall' },
];

export const Default: Story = {
    args: {
        title: 'Photo Gallery',
        items: sampleMedia,
        columns: 3,
    },
};

export const TwoColumns: Story = {
    args: {
        title: 'Portfolio',
        items: sampleMedia.slice(0, 4),
        columns: 2,
    },
};

export const FourColumns: Story = {
    args: {
        title: 'Media Library',
        items: sampleMedia,
        columns: 4,
    },
};

export const SquareAspectRatio: Story = {
    args: {
        title: 'Instagram Style',
        items: sampleMedia,
        columns: 3,
        aspectRatio: 'square',
    },
};

export const PortraitAspectRatio: Story = {
    args: {
        title: 'Portrait Gallery',
        items: sampleMedia.slice(0, 3),
        columns: 3,
        aspectRatio: 'portrait',
    },
};

export const Selectable: Story = {
    args: {
        title: 'Select Images',
        items: sampleMedia,
        columns: 3,
        selectable: true,
    },
};

export const WithUpload: Story = {
    args: {
        title: 'Upload Media',
        items: sampleMedia.slice(0, 3),
        columns: 3,
        showUpload: true,
    },
};

export const WithActions: Story = {
    args: {
        title: 'Managed Gallery',
        items: sampleMedia,
        columns: 3,
        selectable: true,
        showUpload: true,
        actions: [
            { label: 'Delete Selected', event: 'DELETE_MEDIA' },
            { label: 'Download All', event: 'DOWNLOAD_MEDIA' },
        ],
    },
};

export const Loading: Story = {
    args: {
        title: 'Loading Gallery',
        isLoading: true,
    },
};

export const Empty: Story = {
    args: {
        title: 'Empty Gallery',
        items: [],
        showUpload: true,
    },
};
