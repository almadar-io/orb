/**
 * OrbPreviewBlock — MDX component that shows an .orb schema as code
 * alongside its live rendered preview with mock data.
 *
 * Replicates the playground's mock-data + schema-adjustment pipeline.
 */

import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';

export interface OrbPreviewBlockProps {
  schema: string;
  title?: string;
  showCode?: boolean;
  height?: string;
}

// ---------------------------------------------------------------------------
// Mock data pipeline (from PlaygroundContent.tsx)
// ---------------------------------------------------------------------------

function buildMockData(schema: Record<string, unknown>): Record<string, unknown[]> {
  const result: Record<string, unknown[]> = {};
  const orbitals = schema.orbitals as Record<string, unknown>[] | undefined;
  if (!orbitals?.length) return result;

  for (const orbital of orbitals) {
    const entity = orbital.entity as Record<string, unknown> | undefined;
    if (!entity) continue;
    const fields = (entity.fields as Record<string, unknown>[]) ?? [];
    const entityName = entity.name as string;

    const instances = entity.instances as Record<string, unknown>[] | undefined;
    if (instances && instances.length > 0) {
      result[entityName] = instances;
      continue;
    }

    const items = Array.from({ length: 10 }, (_, i) => {
      const idx = i + 1;
      const item: Record<string, unknown> = { id: String(idx) };
      for (const f of fields) {
        const fname = f.name as string;
        if (fname === 'id') continue;
        const ftype = f.type as string;
        const values = f.values as string[] | undefined;
        if (values && values.length > 0) {
          item[fname] = values[i % values.length];
        } else if (ftype === 'string') {
          item[fname] = `${entityName} ${fname.charAt(0).toUpperCase() + fname.slice(1)} ${idx}`;
        } else if (ftype === 'number') {
          item[fname] = idx * 10;
        } else if (ftype === 'boolean') {
          item[fname] = idx % 2 === 0;
        } else {
          item[fname] = f.default ?? null;
        }
      }
      return item;
    });
    result[entityName] = items;
  }
  return result;
}

function adjustSchemaForMockData(
  schema: Record<string, unknown>,
  mockData: Record<string, unknown[]>,
): Record<string, unknown> {
  const orbitals = schema.orbitals as Record<string, unknown>[] | undefined;
  if (!orbitals?.length) return schema;

  let changed = false;
  const updatedOrbitals = orbitals.map((orbital) => {
    const traits = (orbital.traits as Record<string, unknown>[]) ?? [];
    const updatedTraits = traits.map((trait) => {
      const sm = trait.stateMachine as Record<string, unknown> | undefined;
      if (!sm) return trait;

      const linkedEntity = trait.linkedEntity as string | undefined;
      if (!linkedEntity || !mockData[linkedEntity]?.length) return trait;

      const states = (sm.states as Record<string, unknown>[]) ?? [];
      const transitions = (sm.transitions as Record<string, unknown>[]) ?? [];

      const initialStateName =
        (states.find((s) => s.isInitial)?.name as string) ??
        (states[0]?.name as string);
      if (!initialStateName) return trait;

      const dataState = states.find((s) => {
        const name = s.name as string;
        if (name === initialStateName) return false;
        return transitions.some(
          (t) =>
            t.event === 'INIT' &&
            (t.from === name ||
              (Array.isArray(t.from) && (t.from as string[]).includes(name))),
        );
      });

      if (!dataState) return trait;

      changed = true;
      const dataStateName = dataState.name as string;
      const updatedStates = states.map((s) => {
        if ((s.name as string) === initialStateName)
          return { ...s, isInitial: false };
        if ((s.name as string) === dataStateName)
          return { ...s, isInitial: true };
        return s;
      });

      return { ...trait, stateMachine: { ...sm, states: updatedStates } };
    });

    return updatedTraits !== traits
      ? { ...orbital, traits: updatedTraits }
      : orbital;
  });

  return changed ? { ...schema, orbitals: updatedOrbitals } : schema;
}

/**
 * Inject mock instances directly into entity definitions.
 * This ensures OrbPreview seeds the entity store via initialData
 * before TraitInitializer fires INIT.
 */
function injectInstances(
  schema: Record<string, unknown>,
  mockData: Record<string, unknown[]>,
): Record<string, unknown> {
  const orbitals = schema.orbitals as Record<string, unknown>[] | undefined;
  if (!orbitals?.length) return schema;

  const updatedOrbitals = orbitals.map((orbital) => {
    const entity = orbital.entity as Record<string, unknown> | undefined;
    if (!entity) return orbital;
    const entityName = entity.name as string;
    const records = mockData[entityName];
    if (!records?.length) return orbital;
    // Add instances field so OrbPreview runtime can seed entity store
    return { ...orbital, entity: { ...entity, instances: records } };
  });

  return { ...schema, orbitals: updatedOrbitals };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OrbPreviewBlock({
  schema,
  title,
  showCode = true,
  height = '400px',
}: OrbPreviewBlockProps): React.ReactElement {
  const { finalSchema, mockData } = React.useMemo(() => {
    try {
      const parsed = JSON.parse(schema);
      const mock = buildMockData(parsed);
      const adjusted = adjustSchemaForMockData(parsed, mock);
      const withInstances = injectInstances(adjusted, mock);
      return { finalSchema: withInstances, mockData: mock };
    } catch {
      return { finalSchema: null, mockData: {} };
    }
  }, [schema]);

  return (
    <div style={{ marginBlock: '1.5rem' }}>
      {title && (
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{title}</p>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showCode ? '1fr 1fr' : '1fr',
          gap: '1rem',
          alignItems: 'stretch',
        }}
      >
        {showCode && (
          <div style={{ overflow: 'auto', maxHeight: height }}>
            <CodeBlock language="json" title="schema.orb">
              {schema.trim()}
            </CodeBlock>
          </div>
        )}
        <BrowserOnly fallback={<div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--ifm-color-emphasis-300)', borderRadius: '8px' }}>Loading preview...</div>}>
          {() => {
            const { OrbPreview } = require('@almadar/ui/runtime');
            return (
              <OrbPreview
                schema={finalSchema ?? schema}
                mockData={mockData}
                height={height}
              />
            );
          }}
        </BrowserOnly>
      </div>
    </div>
  );
}
