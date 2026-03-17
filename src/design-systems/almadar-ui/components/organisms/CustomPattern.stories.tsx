import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomPattern, renderCustomPattern, type CustomPatternConfig } from './CustomPattern';

const meta: Meta<typeof CustomPattern> = {
  title: 'Organisms/CustomPattern',
  component: CustomPattern,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    component: 'div',
    className: 'p-4 bg-[var(--color-muted)] rounded-lg',
    content: 'A simple custom div rendered via the pattern system.',
  },
};

export const ButtonElement: Story = {
  args: {
    component: 'button',
    className: 'bg-blue-500 text-white px-4 py-2 rounded',
    action: 'SUBMIT',
    content: 'Submit Form',
  },
};

export const LinkElement: Story = {
  args: {
    component: 'a',
    href: 'https://example.com',
    external: true,
    className: 'text-blue-600 underline hover:text-blue-800',
    content: 'Visit Example.com',
  },
};

export const HeadingElement: Story = {
  args: {
    component: 'h2',
    className: 'text-2xl font-bold',
    content: 'Custom Heading Pattern',
  },
};

export const ImageElement: Story = {
  args: {
    component: 'img',
    src: 'https://via.placeholder.com/300x200',
    alt: 'Placeholder image',
    className: 'rounded-lg shadow-md',
  },
};

export const DisabledButton: Story = {
  args: {
    component: 'button',
    action: 'CLICK',
    disabled: true,
    content: 'Disabled Button',
  },
};

export const NestedCustomPatterns: Story = {
  render: () => {
    const config: CustomPatternConfig = {
      type: 'custom',
      component: 'section',
      className: 'p-6 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)]',
      children: [
        {
          type: 'custom',
          component: 'h3',
          className: 'text-lg font-semibold mb-2',
          content: 'Nested Pattern Demo',
        },
        {
          type: 'custom',
          component: 'p',
          className: 'text-[var(--color-muted-foreground)] mb-4',
          content: 'This demonstrates recursively rendered custom patterns.',
        },
        {
          type: 'custom',
          component: 'button',
          className: 'bg-blue-500 text-white px-3 py-1.5 rounded',
          action: 'NESTED_ACTION',
          content: 'Nested Action',
        },
      ],
    };

    return renderCustomPattern(config);
  },
};

export const SemanticElements: Story = {
  render: () => {
    const config: CustomPatternConfig = {
      type: 'custom',
      component: 'article',
      className: 'p-4 border border-[var(--color-border)] rounded-lg',
      children: [
        {
          type: 'custom',
          component: 'header',
          className: 'pb-3 border-b border-[var(--color-border)] mb-3',
          children: [
            {
              type: 'custom',
              component: 'h2',
              className: 'text-xl font-bold',
              content: 'Article Title',
            },
          ],
        },
        {
          type: 'custom',
          component: 'p',
          content: 'Article body content rendered with semantic HTML elements via the CustomPattern system.',
        },
        {
          type: 'custom',
          component: 'footer',
          className: 'pt-3 mt-3 border-t border-[var(--color-border)] text-sm text-[var(--color-muted-foreground)]',
          content: 'Published on February 18, 2026',
        },
      ],
    };

    return renderCustomPattern(config);
  },
};
