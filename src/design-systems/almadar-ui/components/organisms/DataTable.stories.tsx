import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from './DataTable';
import { Database } from 'lucide-react';

const meta: Meta<typeof DataTable> = {
    title: 'Organisms/DataTable',
    component: DataTable,
    parameters: {
        layout: 'padded',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
}

const sampleData: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Editor', status: 'Pending' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Inactive' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
];

const columns = [
    { key: 'name' as const, header: 'Name', sortable: true },
    { key: 'email' as const, header: 'Email', sortable: true },
    { key: 'role' as const, header: 'Role', sortable: true },
    { key: 'status' as const, header: 'Status', sortable: true },
];

export const Default: Story = {
    args: {
        entity: sampleData,
        columns: columns,
    },
};

export const WithSearch: Story = {
    args: {
        entity: sampleData,
        columns: columns,
        searchable: true,
        searchPlaceholder: 'Search users...',
    },
};

export const Selectable: Story = {
    args: {
        entity: sampleData,
        columns: columns,
        selectable: true,
    },
};

export const Loading: Story = {
    args: {
        entity: [],
        columns: columns,
        isLoading: true,
    },
};

export const Empty: Story = {
    args: {
        entity: [],
        columns: columns,
        emptyIcon: Database,
        emptyTitle: 'No users found',
        emptyDescription: 'No users have been added yet. Create your first user to get started.',
    },
};

export const WithItemActions: Story = {
    args: {
        entity: sampleData,
        columns: columns,
        itemActions: [
            { label: 'View', event: 'VIEW' },
            { label: 'Edit', event: 'EDIT' },
            { label: 'Delete', event: 'DELETE', variant: 'danger' },
        ],
    },
};

export const WithPagination: Story = {
    args: {
        entity: sampleData,
        columns: columns,
        page: 1,
        pageSize: 2,
        totalCount: 5,
    },
};

export const Sorted: Story = {
    args: {
        entity: sampleData,
        columns: columns,
        sortBy: 'name',
        sortDirection: 'asc',
    },
};

export const FullFeatured: Story = {
    args: {
        entity: sampleData,
        columns: [
            { key: 'name' as keyof User, header: 'Name', sortable: true },
            { key: 'email' as keyof User, header: 'Email', sortable: true },
            { key: 'role' as keyof User, header: 'Role', sortable: true },
            {
                key: 'status' as keyof User,
                header: 'Status',
                sortable: true,
                render: (value: unknown) => (
                    <span className={`px-2 py-1 text-xs font-bold border-2 ${value === 'Active' ? 'border-emerald-600 text-emerald-600' :
                            value === 'Pending' ? 'border-amber-500 text-amber-500' :
                                'border-neutral-400 text-neutral-400'
                        }`}>
                        {String(value)}
                    </span>
                ),
            },
        ],
        searchable: true,
        selectable: true,
        sortBy: 'name',
        sortDirection: 'asc',
        itemActions: [
            { label: 'View', event: 'VIEW' },
            { label: 'Edit', event: 'EDIT' },
        ],
    },
};
