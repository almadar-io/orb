import type { Meta, StoryObj } from '@storybook/react-vite';
import { LawReferenceTooltip } from './LawReferenceTooltip';
import { Typography } from './Typography';
import { HStack, VStack } from './Stack';
import { Box } from './Box';

const meta: Meta<typeof LawReferenceTooltip> = {
  title: 'Atoms/LawReferenceTooltip',
  component: LawReferenceTooltip,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    reference: {
      law: 'VVO',
      article: '8',
      lawName: 'Verkehrsverordnung',
      clause: 'Die zulassige Gesamtmasse darf 3500 kg nicht uberschreiten.',
    },
    children: (
      <Typography variant="small" className="text-blue-600 underline cursor-help">
        VVO 8
      </Typography>
    ),
  },
};

export const WithLink: Story = {
  args: {
    reference: {
      law: 'TPED',
      article: 'Art. 5 Abs. 2',
      lawName: 'Transportable Pressure Equipment Directive',
      clause: 'Equipment shall be designed to withstand internal pressure without permanent deformation.',
      link: 'https://example.com/tped',
    },
    children: (
      <Typography variant="small" className="text-blue-600 underline cursor-help">
        TPED Art. 5
      </Typography>
    ),
  },
};

export const MinimalReference: Story = {
  args: {
    reference: {
      law: 'StVO',
      article: '23',
    },
    children: (
      <Typography variant="small" className="text-blue-600 underline cursor-help">
        StVO 23
      </Typography>
    ),
  },
};

export const AllPositions: Story = {
  render: () => (
    <Box padding="2xl">
      <VStack gap="xl" align="center">
        <LawReferenceTooltip
          position="bottom"
          reference={{
            law: 'VVO',
            article: '8',
            clause: 'Tooltip appears below',
          }}
        >
          <Typography variant="small" className="text-blue-600 underline cursor-help">
            Bottom Position
          </Typography>
        </LawReferenceTooltip>

        <HStack gap="xl">
          <LawReferenceTooltip
            position="right"
            reference={{
              law: 'VVO',
              article: '8',
              clause: 'Tooltip appears to the right',
            }}
          >
            <Typography variant="small" className="text-blue-600 underline cursor-help">
              Right Position
            </Typography>
          </LawReferenceTooltip>

          <LawReferenceTooltip
            position="left"
            reference={{
              law: 'VVO',
              article: '8',
              clause: 'Tooltip appears to the left',
            }}
          >
            <Typography variant="small" className="text-blue-600 underline cursor-help">
              Left Position
            </Typography>
          </LawReferenceTooltip>
        </HStack>

        <LawReferenceTooltip
          position="top"
          reference={{
            law: 'VVO',
            article: '8',
            clause: 'Tooltip appears above',
          }}
        >
          <Typography variant="small" className="text-blue-600 underline cursor-help">
            Top Position (default)
          </Typography>
        </LawReferenceTooltip>
      </VStack>
    </Box>
  ),
};

export const InFormContext: Story = {
  render: () => (
    <Box padding="lg" className="w-96">
      <VStack gap="md">
        <VStack gap="xs">
          <HStack gap="xs" align="center">
            <Typography variant="label" weight="bold">Vehicle Weight (kg)</Typography>
            <LawReferenceTooltip
              reference={{
                law: 'VVO',
                article: '8 Abs. 3',
                lawName: 'Verkehrsverordnung',
                clause: 'Fahrzeuge mit einer zulassigen Gesamtmasse von mehr als 3500 kg benotigen eine Sondergenehmigung.',
              }}
            >
              <Typography variant="caption" className="text-blue-600 cursor-help">
                [VVO 8]
              </Typography>
            </LawReferenceTooltip>
          </HStack>
          <Box
            as="input"
            border
            rounded="md"
            padding="sm"
            fullWidth
            // @ts-expect-error - input props
            type="number"
            placeholder="Enter weight"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </VStack>

        <VStack gap="xs">
          <HStack gap="xs" align="center">
            <Typography variant="label" weight="bold">Hazardous Materials</Typography>
            <LawReferenceTooltip
              reference={{
                law: 'ADR',
                article: 'Section 1.1.3.6',
                lawName: 'Agreement concerning Dangerous Goods by Road',
                clause: 'The carriage of dangerous goods is subject to compliance with specific conditions.',
                link: 'https://example.com/adr',
              }}
            >
              <Typography variant="caption" className="text-blue-600 cursor-help">
                [ADR 1.1.3.6]
              </Typography>
            </LawReferenceTooltip>
          </HStack>
          <Box
            as="select"
            border
            rounded="md"
            padding="sm"
            fullWidth
            className="focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select classification</option>
            <option value="class1">Class 1 - Explosives</option>
            <option value="class2">Class 2 - Gases</option>
            <option value="class3">Class 3 - Flammable Liquids</option>
          </Box>
        </VStack>
      </VStack>
    </Box>
  ),
};

export const MultipleReferences: Story = {
  render: () => (
    <Box padding="lg">
      <Typography variant="body">
        This inspection form requires compliance with multiple regulations including{' '}
        <LawReferenceTooltip
          reference={{
            law: 'VVO',
            article: '8',
            lawName: 'Verkehrsverordnung',
            clause: 'Weight and dimension requirements for road vehicles.',
          }}
        >
          <Typography as="span" variant="body" className="text-blue-600 underline cursor-help">
            VVO 8
          </Typography>
        </LawReferenceTooltip>
        ,{' '}
        <LawReferenceTooltip
          reference={{
            law: 'ADR',
            article: '1.1.3.6',
            lawName: 'Dangerous Goods Agreement',
            clause: 'Specific requirements for dangerous goods transport.',
          }}
        >
          <Typography as="span" variant="body" className="text-blue-600 underline cursor-help">
            ADR 1.1.3.6
          </Typography>
        </LawReferenceTooltip>
        , and{' '}
        <LawReferenceTooltip
          reference={{
            law: 'TPED',
            article: 'Art. 5',
            lawName: 'Transportable Pressure Equipment',
            clause: 'Design and manufacturing requirements for pressure equipment.',
          }}
        >
          <Typography as="span" variant="body" className="text-blue-600 underline cursor-help">
            TPED Art. 5
          </Typography>
        </LawReferenceTooltip>
        .
      </Typography>
    </Box>
  ),
};
