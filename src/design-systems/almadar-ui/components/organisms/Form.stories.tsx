import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useEffect } from 'react';
import { Form, type SchemaField, type FormSection, type HiddenCalculation, type ViolationTrigger } from './Form';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Box } from '../atoms/Box';
import { Alert } from '../molecules/Alert';
import { useEventBus } from '../../hooks/useEventBus';

const meta: Meta<typeof Form> = {
  title: 'Organisms/Form',
  component: Form,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic field definitions
const basicFields: SchemaField[] = [
  { name: 'firstName', label: 'First Name', type: 'string', required: true },
  { name: 'lastName', label: 'Last Name', type: 'string', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'age', label: 'Age', type: 'number' },
];

export const Default: Story = {
  args: {
    fields: basicFields,
    entity: 'User',
    submitLabel: 'Save User',
  },
};

export const WithInitialData: Story = {
  args: {
    fields: basicFields,
    entity: 'User',
    initialData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      age: 30,
    },
    submitLabel: 'Update User',
  },
};

export const HorizontalLayout: Story = {
  args: {
    fields: basicFields.slice(0, 2),
    entity: 'User',
    layout: 'horizontal',
    gap: 'lg',
  },
};

// Fields with different types
const mixedTypeFields: SchemaField[] = [
  { name: 'name', label: 'Full Name', type: 'string', required: true },
  { name: 'bio', label: 'Biography', type: 'textarea', max: 500 },
  { name: 'birthDate', label: 'Birth Date', type: 'date' },
  { name: 'salary', label: 'Salary', type: 'number' },
  { name: 'isActive', label: 'Active', type: 'boolean' },
  {
    name: 'role',
    label: 'Role',
    type: 'enum',
    values: ['admin', 'editor', 'viewer'],
    required: true,
  },
];

export const MixedFieldTypes: Story = {
  args: {
    fields: mixedTypeFields,
    entity: 'Employee',
    submitLabel: 'Create Employee',
  },
};

export const Loading: Story = {
  args: {
    fields: basicFields,
    entity: 'User',
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    fields: basicFields,
    entity: 'User',
    error: new Error('Failed to load user data. Please try again.'),
  },
};

// ============================================================================
// Inspection Form Extensions
// ============================================================================

/**
 * Conditional Fields - fields that show/hide based on other field values
 */
const vehicleFields: SchemaField[] = [
  {
    name: 'vehicleType',
    label: 'Vehicle Type',
    type: 'enum',
    values: ['personal', 'commercial'],
    required: true,
  },
  { name: 'licensePlate', label: 'License Plate', type: 'string', required: true },
  { name: 'commercialLicense', label: 'Commercial License Number', type: 'string' },
  { name: 'fleetSize', label: 'Fleet Size', type: 'number' },
  { name: 'weight', label: 'Vehicle Weight (kg)', type: 'number' },
  { name: 'heavyVehiclePermit', label: 'Heavy Vehicle Permit Number', type: 'string' },
];

export const WithConditionalFields: Story = {
  render: function ConditionalFieldsDemo() {
    const [formValues, setFormValues] = useState<Record<string, unknown>>({
      vehicleType: 'personal',
    });

    return (
      <VStack gap="md" className="max-w-lg">
        <Typography variant="h4">Vehicle Registration</Typography>
        <Typography variant="body2" color="muted">
          Select &quot;commercial&quot; to see additional fields. Enter weight &gt;= 3500 to see permit field.
        </Typography>
        <Form
          fields={vehicleFields}
          entity="Vehicle"
          initialData={formValues}
          conditionalFields={{
            commercialLicense: ['=', '@entity.formValues.vehicleType', 'commercial'],
            fleetSize: ['=', '@entity.formValues.vehicleType', 'commercial'],
            heavyVehiclePermit: ['>=', '@entity.formValues.weight', 3500],
          }}
          onFieldChange={({ formValues: newValues }) => setFormValues(newValues)}
          submitLabel="Register Vehicle"
        />
      </VStack>
    );
  },
};

/**
 * Hidden Calculations - computed values that emit GLOBAL_VARIABLE_SET events
 */
const inspectionFields: SchemaField[] = [
  {
    name: 'inspectionLocation',
    label: 'Inspection Location',
    type: 'enum',
    values: ['merchant_premises', 'inspector_office', 'private_premises', 'other'],
    required: true,
  },
  {
    name: 'servesConsumers',
    label: 'Business serves consumers',
    type: 'enum',
    values: ['yes', 'no'],
    required: true,
  },
  { name: 'businessName', label: 'Business Name', type: 'string', required: true },
];

const hiddenCalculations: HiddenCalculation[] = [
  {
    variableName: 'HG_INSPECTION_LOCATION',
    expression: '@entity.formValues.inspectionLocation',
    triggerFields: ['inspectionLocation'],
  },
  {
    variableName: 'HG_SERVES_CONSUMERS',
    expression: ['=', '@entity.formValues.servesConsumers', 'yes'],
    triggerFields: ['servesConsumers'],
  },
];

export const WithHiddenCalculations: Story = {
  render: function HiddenCalculationsDemo() {
    const [events, setEvents] = useState<Array<{ type: string; payload: unknown; time: string }>>([]);
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});
    const eventBus = useEventBus();

    useEffect(() => {
      const unsubGlobal = eventBus.on('UI:GLOBAL_VARIABLE_SET', (payload) => {
        console.log('[HiddenCalculations] UI:GLOBAL_VARIABLE_SET', payload);
        setEvents(prev => [...prev, {
          type: 'GLOBAL_VARIABLE_SET',
          payload,
          time: new Date().toLocaleTimeString(),
        }]);
      });

      const unsubField = eventBus.on('UI:FIELD_CHANGED', (payload) => {
        console.log('[HiddenCalculations] UI:FIELD_CHANGED', payload);
        setEvents(prev => [...prev, {
          type: 'FIELD_CHANGED',
          payload,
          time: new Date().toLocaleTimeString(),
        }]);
      });

      return () => {
        unsubGlobal();
        unsubField();
      };
    }, [eventBus]);

    return (
      <VStack gap="md" className="max-w-lg">
        <Typography variant="h4">Introduction Form (T-001)</Typography>
        <Typography variant="body2" color="muted">
          Hidden calculations set global variables when fields change.
          Change the fields below and watch the event log update.
        </Typography>
        <Form
          fields={inspectionFields}
          entity="InspectionForm"
          hiddenCalculations={hiddenCalculations}
          evaluationContext={{
            formValues,
            globalVariables: {},
          }}
          onFieldChange={({ formValues: newValues }) => setFormValues(newValues)}
          submitLabel="Continue"
        />
        <Box padding="md" bg="muted" rounded="md">
          <VStack gap="sm">
            <Typography variant="label" weight="bold">Event Log:</Typography>
            {events.length === 0 ? (
              <Typography variant="caption" color="muted">
                No events yet. Change a field to see events.
              </Typography>
            ) : (
              <VStack gap="xs" className="max-h-48 overflow-y-auto">
                {events.slice(-10).reverse().map((event, i) => (
                  <Box key={i} padding="xs" rounded="sm" className="bg-white text-xs font-mono">
                    <Typography variant="caption" color={event.type === 'GLOBAL_VARIABLE_SET' ? 'success' : 'muted'}>
                      [{event.time}] {event.type}
                    </Typography>
                    <Typography variant="caption" className="block text-gray-600">
                      {JSON.stringify(event.payload)}
                    </Typography>
                  </Box>
                ))}
              </VStack>
            )}
            <button
              onClick={() => setEvents([])}
              className="text-xs text-blue-600 hover:underline self-start"
            >
              Clear log
            </button>
          </VStack>
        </Box>
      </VStack>
    );
  },
};

/**
 * Violation Triggers - conditions that emit VIOLATION_DETECTED events
 */
const priceMarkingFields: SchemaField[] = [
  {
    name: 'priceMarking',
    label: '2.8. Selected goods are marked with price',
    type: 'enum',
    values: ['marked', 'not_marked', 'partially_marked'],
    required: true,
  },
  { name: 'violationNotes', label: 'Violation Notes', type: 'textarea' },
];

const violationTriggers: ViolationTrigger[] = [
  {
    condition: ['=', '@entity.formValues.priceMarking', 'not_marked'],
    violation: {
      law: 'ZVPOT-1',
      article: '14/1',
      actionType: 'admin',
      message: 'Goods must be marked with visible price tags',
    },
    fieldId: 'priceMarking',
  },
  {
    condition: ['=', '@entity.formValues.priceMarking', 'partially_marked'],
    violation: {
      law: 'ZVPOT-1',
      article: '14/1',
      actionType: 'measure',
      message: 'Some goods are missing price tags',
    },
    fieldId: 'priceMarking',
  },
];

export const WithViolationTriggers: Story = {
  render: function ViolationTriggersDemo() {
    const [currentViolation, setCurrentViolation] = useState<{
      law: string;
      article: string;
      actionType: string;
      message: string;
    } | null>(null);
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});
    const eventBus = useEventBus();

    useEffect(() => {
      const unsub = eventBus.on('UI:VIOLATION_DETECTED', (payload: unknown) => {
        const violation = payload as {
          law: string;
          article: string;
          actionType: string;
          message: string;
        };
        console.log('[ViolationTriggers] UI:VIOLATION_DETECTED', violation);
        setCurrentViolation(violation);
      });

      return () => unsub();
    }, [eventBus]);

    // Clear violation when user selects compliant option
    useEffect(() => {
      if (formValues.priceMarking === 'marked' || !formValues.priceMarking) {
        setCurrentViolation(null);
      }
    }, [formValues.priceMarking]);

    return (
      <VStack gap="md" className="max-w-lg">
        <Typography variant="h4">Price Marking Inspection (T2-1)</Typography>
        <Typography variant="body2" color="muted">
          Select &quot;not_marked&quot; or &quot;partially_marked&quot; to trigger a violation.
        </Typography>
        {currentViolation && (
          <Alert variant={currentViolation.actionType === 'admin' ? 'error' : 'warning'}>
            <VStack gap="xs">
              <Typography variant="body2" weight="bold">
                {currentViolation.law} Art. {currentViolation.article} ({currentViolation.actionType})
              </Typography>
              <Typography variant="body2">{currentViolation.message}</Typography>
            </VStack>
          </Alert>
        )}
        <Form
          fields={priceMarkingFields}
          entity="InspectionForm"
          violationTriggers={violationTriggers}
          evaluationContext={{
            formValues,
            globalVariables: {},
          }}
          conditionalFields={{
            violationNotes: ['or',
              ['=', '@entity.formValues.priceMarking', 'not_marked'],
              ['=', '@entity.formValues.priceMarking', 'partially_marked'],
            ],
          }}
          onFieldChange={({ formValues: newValues }) => setFormValues(newValues)}
          submitLabel="Save Findings"
        />
      </VStack>
    );
  },
};

/**
 * Form Sections - nested collapsible sections
 */
const sectionFields1: SchemaField[] = [
  { name: 'inspectorName', label: 'Inspector Name', type: 'string', required: true },
  { name: 'inspectionDate', label: 'Inspection Date', type: 'date', required: true },
  { name: 'caseNumber', label: 'Case Number', type: 'string' },
];

const sectionFields2: SchemaField[] = [
  { name: 'companyName', label: 'Company Name', type: 'string', required: true },
  { name: 'taxNumber', label: 'Tax Number', type: 'string', required: true },
  { name: 'address', label: 'Address', type: 'string' },
];

const sectionFields3: SchemaField[] = [
  {
    name: 'businessType',
    label: 'Business Type',
    type: 'enum',
    values: ['retail', 'wholesale', 'manufacturing', 'services'],
  },
  { name: 'employeeCount', label: 'Number of Employees', type: 'number' },
];

const formSections: FormSection[] = [
  {
    id: 'S-1',
    title: 'Case Information',
    fields: sectionFields1,
    collapsible: true,
  },
  {
    id: 'S-2',
    title: 'Company Data',
    fields: sectionFields2,
    collapsible: true,
  },
  {
    id: 'S-3',
    title: 'Business Details',
    fields: sectionFields3,
    collapsible: true,
    condition: ['!=', '@entity.formValues.companyName', ''],
  },
];

export const WithSections: Story = {
  render: function SectionsDemo() {
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});

    return (
      <VStack gap="md" className="max-w-lg">
        <Typography variant="h4">Inspection Introduction (T-001)</Typography>
        <Typography variant="body2" color="muted">
          Form with collapsible sections. Section 3 appears after entering company name.
        </Typography>
        <Form
          entity="InspectionForm"
          sections={formSections}
          initialData={formValues}
          evaluationContext={{
            formValues,
            globalVariables: {},
          }}
          onFieldChange={({ formValues: newValues }) => setFormValues(newValues)}
          submitLabel="Continue to Next Tab"
        />
      </VStack>
    );
  },
};

/**
 * Complete Inspection Form Example
 */
const completeInspectionFields: SchemaField[] = [
  { name: 'inspectorId', label: 'Inspector ID', type: 'string', required: true },
];

const completeInspectionSections: FormSection[] = [
  {
    id: 'S-1',
    title: 'A. Case Data',
    collapsible: true,
    fields: [
      {
        name: 'A7',
        label: 'A.7. Other inspectors participating',
        type: 'enum',
        values: ['yes', 'no'],
      },
      { name: 'A8', label: 'A.8. Inspector name', type: 'string' },
      {
        name: 'A9',
        label: 'A.9. Inspection location',
        type: 'enum',
        values: ['merchant_premises', 'inspector_office', 'private_premises'],
        required: true,
      },
      {
        name: 'A10',
        label: 'A.10. Permission obtained',
        type: 'enum',
        values: ['yes', 'no'],
      },
    ],
  },
  {
    id: 'S-2',
    title: 'B. Entity Data',
    collapsible: true,
    fields: [
      { name: 'B1', label: 'B.1. Company Name', type: 'string', required: true },
      { name: 'B2', label: 'B.2. Tax ID', type: 'string', required: true },
      { name: 'B3', label: 'B.3. Address', type: 'string' },
    ],
  },
];

const completeHiddenCalcs: HiddenCalculation[] = [
  {
    variableName: 'HG_INSPECTION_LOCATION',
    expression: '@entity.formValues.A9',
    triggerFields: ['A9'],
  },
];

export const CompleteInspectionForm: Story = {
  render: function CompleteInspectionDemo() {
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});

    return (
      <VStack gap="md" className="max-w-2xl">
        <Typography variant="h3">T-001: Introduction</Typography>
        <Typography variant="body2" color="muted">
          Complete inspection form with sections, conditional fields, and hidden calculations.
        </Typography>
        <Form
          entity="InspectionForm"
          fields={completeInspectionFields}
          sections={completeInspectionSections}
          initialData={formValues}
          conditionalFields={{
            A8: ['=', '@entity.formValues.A7', 'yes'],
            A10: ['=', '@entity.formValues.A9', 'private_premises'],
          }}
          hiddenCalculations={completeHiddenCalcs}
          evaluationContext={{
            formValues,
            globalVariables: {},
          }}
          onFieldChange={({ formValues: newValues }) => setFormValues(newValues)}
          submitLabel="Complete Introduction"
          cancelLabel="Save Draft"
          showCancel
        />
      </VStack>
    );
  },
};

/**
 * Cross-form dependencies using global variables
 */
export const WithGlobalVariables: Story = {
  render: function GlobalVariablesDemo() {
    const [globalVars, setGlobalVars] = useState({
      HG_SERVES_CONSUMERS: true,
      HG_SALES_LOCATION: 'retail_store',
    });

    const priceFields: SchemaField[] = [
      {
        name: 'conductPriceCheck',
        label: '2.1. Conduct price marking inspection',
        type: 'enum',
        values: ['yes', 'no'],
      },
      { name: 'findingsNotes', label: 'Findings', type: 'textarea' },
    ];

    return (
      <VStack gap="md" className="max-w-lg">
        <Typography variant="h4">Price Marking Section</Typography>
        <Typography variant="body2" color="muted">
          This section is only enabled when HG_SERVES_CONSUMERS is true.
          Toggle the checkbox to simulate cross-form dependency.
        </Typography>

        <Box padding="md" bg="muted" rounded="md">
          <VStack gap="sm">
            <Typography variant="label" weight="bold">Global Variables (from other tabs):</Typography>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={globalVars.HG_SERVES_CONSUMERS}
                onChange={(e) => setGlobalVars(prev => ({
                  ...prev,
                  HG_SERVES_CONSUMERS: e.target.checked,
                }))}
              />
              <Typography variant="body2">HG_SERVES_CONSUMERS</Typography>
            </label>
          </VStack>
        </Box>

        {!globalVars.HG_SERVES_CONSUMERS ? (
          <Alert variant="warning">
            Price marking inspection is not applicable when business does not serve consumers.
          </Alert>
        ) : (
          <Form
            fields={priceFields}
            entity="InspectionForm"
            evaluationContext={{
              formValues: {},
              globalVariables: globalVars,
            }}
            submitLabel="Save Price Marking"
          />
        )}
      </VStack>
    );
  },
};
