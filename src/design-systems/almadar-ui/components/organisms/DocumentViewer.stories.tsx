import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocumentViewer } from './DocumentViewer';

const meta: Meta<typeof DocumentViewer> = {
    title: 'Organisms/DocumentViewer',
    component: DocumentViewer,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TextDocument: Story = {
    args: {
        title: 'README.md',
        content: `# Getting Started

Welcome to the project! This guide will help you set up your development environment.

## Prerequisites

- Node.js 18+
- pnpm 8+
- Git

## Installation

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Project Structure

The project follows a monorepo structure with packages organized by domain:

- \`packages/ui\` — Component library
- \`packages/core\` — Core types and utilities
- \`packages/runtime\` — Runtime engine

## Contributing

Please read CONTRIBUTING.md before submitting pull requests.`,
        documentType: 'text',
        height: 400,
    },
};

export const HTMLContent: Story = {
    args: {
        title: 'Invoice Preview',
        content: `<div style="font-family: Arial; padding: 2rem;">
            <h1 style="color: #1a1a2e;">Invoice #INV-2025-001</h1>
            <p><strong>Date:</strong> February 10, 2025</p>
            <p><strong>Client:</strong> Acme Corp</p>
            <hr/>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f0f0f0;">
                    <th style="padding: 8px; text-align: left;">Item</th>
                    <th style="padding: 8px; text-align: right;">Amount</th>
                </tr>
                <tr>
                    <td style="padding: 8px;">Development Services</td>
                    <td style="padding: 8px; text-align: right;">$5,000</td>
                </tr>
                <tr>
                    <td style="padding: 8px;">Design Consultation</td>
                    <td style="padding: 8px; text-align: right;">$2,500</td>
                </tr>
                <tr style="font-weight: bold; border-top: 2px solid #333;">
                    <td style="padding: 8px;">Total</td>
                    <td style="padding: 8px; text-align: right;">$7,500</td>
                </tr>
            </table>
        </div>`,
        documentType: 'html',
        height: 400,
    },
};

export const PDFViewer: Story = {
    args: {
        title: 'Sample PDF',
        src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        documentType: 'pdf',
        totalPages: 1,
        height: 500,
    },
};

export const MarkdownDocument: Story = {
    args: {
        title: 'Change Log',
        content: `# Changelog

## v2.5.0 (2025-02-10)

### Added
- New Chart component with 5 chart types
- Meter component with linear, radial, and segmented variants
- Timeline component for chronological events
- MediaGallery with lightbox support

### Fixed
- Typography variant validation
- Overlay children prop issue

### Changed
- Updated Storybook configuration for faster builds`,
        documentType: 'markdown',
        height: 400,
    },
};

export const WithToolbar: Story = {
    args: {
        title: 'Contract Document',
        content: 'This is a sample contract document with toolbar controls enabled for zoom, download, and print functionality.',
        documentType: 'text',
        showToolbar: true,
        showDownload: true,
        showPrint: true,
        height: 300,
    },
};

export const NoToolbar: Story = {
    args: {
        title: 'Embedded Content',
        content: '<div style="padding: 2rem; text-align: center;"><h2>Embedded Preview</h2><p>This viewer has the toolbar disabled for a cleaner embed experience.</p></div>',
        documentType: 'html',
        showToolbar: false,
        height: 200,
    },
};

export const Loading: Story = {
    args: {
        title: 'Loading Document',
        documentType: 'text',
        isLoading: true,
        height: 400,
    },
};
