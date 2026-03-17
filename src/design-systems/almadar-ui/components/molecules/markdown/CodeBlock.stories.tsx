import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Molecules/Markdown/CodeBlock',
  component: CodeBlock,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const TypeScript: Story = {
  args: {
    code: `interface User {
  id: string;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}`,
    language: 'typescript',
  },
};

export const JSON: Story = {
  args: {
    code: `{
  "name": "TaskManagement",
  "states": [
    { "name": "draft", "isInitial": true },
    { "name": "active" },
    { "name": "completed", "isTerminal": true }
  ],
  "transitions": [
    { "from": "draft", "to": "active", "event": "ACTIVATE" }
  ]
}`,
    language: 'json',
  },
};

export const NoBadge: Story = {
  args: {
    code: 'console.log("hello")',
    language: 'javascript',
    showLanguageBadge: false,
    showCopyButton: false,
  },
};
