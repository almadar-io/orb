import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeViewer } from './CodeViewer';

const meta: Meta<typeof CodeViewer> = {
    title: 'Organisms/CodeViewer',
    component: CodeViewer,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCode = `import React from 'react';
import { VStack, HStack, Box } from '../atoms/Stack';
import { Card, Typography, Button } from '../atoms';

export interface DashboardProps {
    title: string;
    children: React.ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({ title, children }) => {
    return (
        <Card className="p-4">
            <VStack gap="md">
                <Typography variant="h2">{title}</Typography>
                <Box className="grid grid-cols-3 gap-4">
                    {children}
                </Box>
            </VStack>
        </Card>
    );
};

Dashboard.displayName = 'Dashboard';`;

export const Default: Story = {
    args: {
        title: 'Dashboard.tsx',
        code: sampleCode,
        language: 'TypeScript',
    },
};

export const WithLineNumbers: Story = {
    args: {
        title: 'Dashboard.tsx',
        code: sampleCode,
        language: 'TypeScript',
        showLineNumbers: true,
    },
};

export const WordWrap: Story = {
    args: {
        title: 'Long Lines Example',
        code: `const veryLongVariable = "This is a very long string that demonstrates word wrapping behavior when the content exceeds the available width of the code viewer container";\n\nconst anotherLongLine = { key1: "value1", key2: "value2", key3: "value3", key4: "value4", key5: "value5", key6: "value6", key7: "value7" };`,
        language: 'JavaScript',
        showLineNumbers: true,
        wordWrap: true,
    },
};

export const DiffMode: Story = {
    args: {
        title: 'Schema Changes',
        mode: 'diff',
        oldValue: `entity User {
    name: string
    email: string
    role: enum(admin, user)
}`,
        newValue: `entity User {
    name: string
    email: string
    phone: string
    role: enum(admin, editor, user)
    createdAt: datetime
}`,
    },
};

export const WithCopy: Story = {
    args: {
        title: 'Configuration',
        code: `{
  "name": "@almadar/ui",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "storybook": "storybook dev -p 6006"
  }
}`,
        language: 'JSON',
        showCopy: true,
        showLineNumbers: true,
    },
};

export const MultipleTabs: Story = {
    args: {
        title: 'Project Files',
        files: [
            {
                label: 'index.ts',
                language: 'TypeScript',
                code: `export { Dashboard } from './Dashboard';\nexport { Sidebar } from './Sidebar';\nexport { Header } from './Header';`,
            },
            {
                label: 'Dashboard.tsx',
                language: 'TypeScript',
                code: sampleCode,
            },
            {
                label: 'styles.css',
                language: 'CSS',
                code: `.dashboard {\n  display: grid;\n  grid-template-columns: 250px 1fr;\n  min-height: 100vh;\n}`,
            },
        ],
        showLineNumbers: true,
        showCopy: true,
    },
};

export const MaxHeight: Story = {
    args: {
        title: 'Scrollable Code',
        code: Array.from({ length: 50 }, (_, i) => `const line${i + 1} = "Content for line ${i + 1}";`).join('\n'),
        language: 'JavaScript',
        showLineNumbers: true,
        maxHeight: 300,
    },
};

export const Loading: Story = {
    args: {
        title: 'Loading Code',
        isLoading: true,
    },
};

export const WithActions: Story = {
    args: {
        title: 'Generated Schema',
        code: `orbital User {\n  entity {\n    name: string\n    email: string\n  }\n  trait CRUD uses std/List {}\n  page /users binds CRUD\n}`,
        language: 'Orbital',
        showLineNumbers: true,
        showCopy: true,
        actions: [
            { label: 'Compile', event: 'COMPILE_SCHEMA' },
            { label: 'Validate', event: 'VALIDATE_SCHEMA' },
        ],
    },
};
