import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownContent } from './MarkdownContent';

const meta: Meta<typeof MarkdownContent> = {
  title: 'Molecules/Markdown/MarkdownContent',
  component: MarkdownContent,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof MarkdownContent>;

const englishMd = `
# Hello World

This is a **bold** and *italic* paragraph with \`inline code\`.

## Lists

- Item one
- Item two
- Item three

## Table

| Name | Value |
|------|-------|
| Alpha | 1 |
| Beta | 2 |

## Math

Euler's identity: $e^{i\\pi} + 1 = 0$

## Blockquote

> This is a blockquote with a [link](https://example.com).
`;

const arabicMd = `
# مقدمة في البرمجة

هذا **نص عريض** و*نص مائل* مع \`كود مضمّن\`.

## قائمة

- العنصر الأول
- العنصر الثاني
- العنصر الثالث

## اقتباس

> البرمجة هي فن حل المشكلات بطريقة منهجية.

## جدول

| الاسم | القيمة |
|-------|--------|
| ألف | ١ |
| باء | ٢ |
`;

export const Default: Story = {
  args: { content: englishMd },
};

export const Arabic: Story = {
  args: { content: arabicMd, direction: 'rtl' },
};

export const Empty: Story = {
  args: { content: '' },
};
