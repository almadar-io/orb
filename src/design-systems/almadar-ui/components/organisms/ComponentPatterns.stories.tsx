import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  ButtonPattern,
  IconButtonPattern,
  TextPattern,
  HeadingPattern,
  BadgePattern,
  AvatarPattern,
  IconPattern,
  CardPattern,
  ProgressBarPattern,
  SpinnerPattern,
  InputPattern,
  SelectPattern,
  CheckboxPattern,
  AlertPattern,
  AccordionPattern,
  ContainerPattern,
} from './ComponentPatterns';
import { VStack, HStack } from '../atoms/Stack';

const meta: Meta<typeof ButtonPattern> = {
  title: 'Organisms/ComponentPatterns',
  component: ButtonPattern,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ButtonPattern>;

export const Default: Story = {
  args: {
    label: 'Click Me',
    variant: 'primary',
    onClick: 'BUTTON_CLICK',
  },
};

export const ButtonVariants: Story = {
  render: () => (
    <HStack gap="md" wrap>
      <ButtonPattern label="Primary" variant="primary" onClick="PRIMARY" />
      <ButtonPattern label="Secondary" variant="secondary" onClick="SECONDARY" />
      <ButtonPattern label="Ghost" variant="ghost" onClick="GHOST" />
      <ButtonPattern label="Danger" variant="danger" onClick="DANGER" />
      <ButtonPattern label="Disabled" variant="primary" disabled onClick="DISABLED" />
      <ButtonPattern label="With Icon" variant="primary" icon="plus" iconPosition="left" onClick="ICON" />
    </HStack>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <HStack gap="md">
      <IconButtonPattern icon="settings" onClick="SETTINGS" ariaLabel="Settings" />
      <IconButtonPattern icon="edit" onClick="EDIT" ariaLabel="Edit" variant="secondary" />
      <IconButtonPattern icon="trash" onClick="DELETE" ariaLabel="Delete" variant="danger" />
    </HStack>
  ),
};

export const DisplayComponents: Story = {
  render: () => (
    <VStack gap="lg">
      <HeadingPattern content="Section Heading" level={2} />
      <TextPattern content="Body text rendered through the pattern system." variant="body" size="md" />
      <HStack gap="sm">
        <BadgePattern label="Active" variant="success" />
        <BadgePattern label="Pending" variant="warning" />
        <BadgePattern label="Error" variant="danger" />
      </HStack>
      <HStack gap="md" align="center">
        <AvatarPattern name="John Doe" size="md" />
        <AvatarPattern name="Jane Smith" size="lg" />
        <IconPattern name="star" size="lg" color="var(--color-warning)" />
      </HStack>
      <ProgressBarPattern value={65} variant="primary" showLabel />
      <SpinnerPattern size="md" />
    </VStack>
  ),
};

export const FormInputs: Story = {
  render: () => (
    <VStack gap="md" className="max-w-sm">
      <InputPattern placeholder="Enter your name" onChange="NAME_CHANGE" />
      <InputPattern inputType="email" placeholder="Email address" onChange="EMAIL_CHANGE" />
      <SelectPattern
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
          { value: 'guest', label: 'Guest' },
        ]}
        placeholder="Select role"
        onChange="ROLE_CHANGE"
      />
      <CheckboxPattern label="Accept terms" onChange="TERMS_CHANGE" />
    </VStack>
  ),
};

export const FeedbackComponents: Story = {
  render: () => (
    <VStack gap="md">
      <AlertPattern variant="info" title="Info" message="This is an informational alert." />
      <AlertPattern variant="success" message="Operation completed successfully." />
      <AlertPattern variant="warning" message="Please review before continuing." dismissible onDismiss="DISMISS_WARNING" />
      <AlertPattern variant="error" title="Error" message="Something went wrong." />
    </VStack>
  ),
};

export const NavigationComponents: Story = {
  render: () => (
    <VStack gap="md">
      <AccordionPattern
        items={[
          { title: 'Section 1', content: <TextPattern content="Content for section one." /> },
          { title: 'Section 2', content: <TextPattern content="Content for section two." /> },
          { title: 'Section 3', content: <TextPattern content="Content for section three." /> },
        ]}
        defaultOpen={[0]}
      />
    </VStack>
  ),
};

export const LayoutComponents: Story = {
  render: () => (
    <ContainerPattern maxWidth="md" padding="lg">
      <CardPattern title="Card Title" subtitle="Card subtitle" padding="lg">
        <VStack gap="sm">
          <TextPattern content="This card is rendered via the pattern system." />
          <ButtonPattern label="Action" variant="primary" onClick="CARD_ACTION" />
        </VStack>
      </CardPattern>
    </ContainerPattern>
  ),
};
