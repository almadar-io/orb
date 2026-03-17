import type { Meta, StoryObj } from '@storybook/react';
import { DebuggerBoard, type DebuggerPuzzleEntity } from './DebuggerBoard';

const meta: Meta<typeof DebuggerBoard> = {
    title: 'Organisms/Game/Puzzles/DebuggerBoard',
    component: DebuggerBoard,
};
export default meta;
type Story = StoryObj<typeof DebuggerBoard>;

const sampleEntity: DebuggerPuzzleEntity = {
    id: 'debug-1',
    title: 'Find the Bugs',
    description: 'This function has 2 bugs. Click on the lines that contain errors.',
    language: 'javascript',
    bugCount: 2,
    lines: [
        { id: 'line-1', content: 'function greet(name) {', isBug: false },
        { id: 'line-2', content: '  const message = "Hello, " + nme;', isBug: true, explanation: 'Typo: "nme" should be "name"' },
        { id: 'line-3', content: '  console.log(message);', isBug: false },
        { id: 'line-4', content: '  return mesage;', isBug: true, explanation: 'Typo: "mesage" should be "message"' },
        { id: 'line-5', content: '}', isBug: false },
    ],
    successMessage: 'All bugs found! Great debugging skills.',
    failMessage: 'Not quite right. Look more carefully at the variable names.',
    hint: 'Check for spelling mistakes in variable names.',
};

/** Default debugger puzzle */
export const Default: Story = {
    args: {
        entity: sampleEntity,
    },
};

/** With header image */
export const WithHeaderImage: Story = {
    args: {
        entity: {
            ...sampleEntity,
            headerImage: 'https://placehold.co/600x200/1a1a2e/e0e0e0?text=Debug+Challenge',
        },
    },
};

/** Many lines */
export const LongListing: Story = {
    args: {
        entity: {
            ...sampleEntity,
            lines: [
                { id: 'l1', content: 'const items = [1, 2, 3];', isBug: false },
                { id: 'l2', content: 'let total = 0;', isBug: false },
                { id: 'l3', content: 'for (let i = 0; i <= items.length; i++) {', isBug: true, explanation: 'Off-by-one: should be i < items.length' },
                { id: 'l4', content: '  total += items[i];', isBug: false },
                { id: 'l5', content: '}', isBug: false },
                { id: 'l6', content: 'console.log("Sum:", totl);', isBug: true, explanation: 'Typo: "totl" should be "total"' },
            ],
            bugCount: 2,
        },
    },
};
