import React, { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import { Search, Sun, Moon, Code, ChevronDown, ChevronUp } from "lucide-react";
import { translate } from "@docusaurus/Translate";
import { BEHAVIOR_CATALOG, type BehaviorEntry } from "../data/behavior-catalog";
import { MODULE_CATALOG } from "../data/module-catalog";
import {
  Box,
  VStack,
  HStack,
  Typography,
  Button,
  Badge,
  Input,
  Select,
  Checkbox,
  Tabs,
  Icon,
  Textarea,
} from "@almadar/ui";
import type { TabItem } from "@almadar/ui";
import { OrbPreview } from "@almadar/ui/runtime";

// Load all theme CSS so data-theme attributes resolve to actual variables
import "@almadar/ui/themes/index.css";

// ─── Runtime loader (for RuntimeDebugger only) ──────────────────────────────

// OrbPreview handles the full runtime stack (providers, slot bridge, schema
// runner, trait initializer). We only load the runtime separately here to
// access RuntimeDebugger, which sits outside the OrbPreview boundary.

interface RuntimeDebuggerComponents {
  RuntimeDebugger: React.ComponentType<{ mode?: 'floating' | 'inline'; defaultCollapsed?: boolean; defaultTab?: string; schema?: Record<string, unknown>; className?: string }>;
}

let debuggerCache: RuntimeDebuggerComponents | null = null;

async function loadDebuggerRuntime(): Promise<RuntimeDebuggerComponents> {
  if (debuggerCache) return debuggerCache;
  const components = await import("@almadar/ui/components");
  debuggerCache = { RuntimeDebugger: components.RuntimeDebugger };
  return debuggerCache;
}

// ─── Theme Options ───────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { value: "wireframe", label: "Wireframe" },
  { value: "minimalist", label: "Minimalist" },
  { value: "almadar", label: "Almadar" },
  { value: "trait-wars", label: "Trait Wars" },
  { value: "ocean", label: "Ocean" },
  { value: "forest", label: "Forest" },
  { value: "sunset", label: "Sunset" },
  { value: "lavender", label: "Lavender" },
  { value: "rose", label: "Rose" },
  { value: "slate", label: "Slate" },
  { value: "ember", label: "Ember" },
  { value: "midnight", label: "Midnight" },
  { value: "sand", label: "Sand" },
  { value: "neon", label: "Neon" },
  { value: "arctic", label: "Arctic" },
  { value: "copper", label: "Copper" },
];

function ThemeControls({
  theme,
  mode,
  onThemeChange,
  onModeToggle,
}: {
  theme: string;
  mode: "light" | "dark";
  onThemeChange: (t: string) => void;
  onModeToggle: () => void;
}) {
  return (
    <HStack gap="sm" align="center" className="flex-shrink-0">
      <Select
        value={theme}
        onChange={(e) => onThemeChange(e.target.value)}
        options={THEME_OPTIONS}
        title="Select theme"
        className="text-xs rounded-md"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={onModeToggle}
        title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
        className="w-[30px] h-[30px] p-0 rounded-md"
      >
        {mode === "light" ? <Sun size={14} /> : <Moon size={14} />}
      </Button>
    </HStack>
  );
}

// ─── Shared: Picker sidebar ───────────────────────────────────────────────────

function Picker<T extends { name: string; description: string }>({
  items,
  selected,
  onSelect,
  getCategory,
}: {
  items: T[];
  selected: string;
  onSelect: (name: string) => void;
  getCategory: (name: string) => string;
}) {
  const [query, setQuery] = useState("");

  const filtered = items.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.description.toLowerCase().includes(query.toLowerCase())
  );

  const byCategory: Record<string, T[]> = {};
  for (const b of filtered) {
    const cat = getCategory(b.name);
    (byCategory[cat] ||= []).push(b);
  }
  const sortedCategories = Object.keys(byCategory).sort();

  return (
    <VStack className="w-[260px] flex-shrink-0 border-r border-[var(--color-border)] overflow-hidden">
      <HStack gap="sm" align="center" className="p-3 border-b border-[var(--color-border)]">
        <Icon icon={Search} size={14} className="flex-shrink-0" />
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-xs w-full p-0 shadow-none ring-0 focus:ring-0"
        />
      </HStack>
      <Box className="flex-1 overflow-y-auto py-2">
        {sortedCategories.map((cat) => (
          <Box key={cat} className="mb-1">
            <Typography
              variant="overline"
              color="muted"
              weight="bold"
              className="text-[0.65rem] uppercase tracking-wider px-3.5 pt-2.5 pb-1"
            >
              {cat}
            </Typography>
            {byCategory[cat].map((b) => (
              <Box
                key={b.name}
                className={`flex flex-col w-full text-left py-1.5 px-3.5 cursor-pointer transition-colors duration-100 ${
                  b.name === selected
                    ? "border-l-2 border-l-[var(--color-primary)]"
                    : ""
                }`}
                onClick={() => onSelect(b.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onSelect(b.name); }}
              >
                <Typography
                  variant="body2"
                  color={b.name === selected ? "primary" : "inherit"}
                  weight="medium"
                  className="text-[0.8rem] font-mono"
                >
                  {b.name.replace(/^std-/, "")}
                </Typography>
                {b.description && (
                  <Typography
                    variant="caption"
                    color="muted"
                    className="text-[0.7rem] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {b.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ))}
        {filtered.length === 0 && (
          <Typography variant="body2" color="muted" align="center" className="p-4 text-[0.8rem]">
            No matches for &quot;{query}&quot;
          </Typography>
        )}
      </Box>
    </VStack>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: BEHAVIORS
// ═══════════════════════════════════════════════════════════════════════════════

const BEHAVIOR_LIST = Object.values(BEHAVIOR_CATALOG).map((b: BehaviorEntry) => ({
  name: b.name,
  description: b.description || "",
}));

const LEVEL_LABELS: Record<string, string> = {
  atom: "Atoms",
  molecule: "Molecules",
  organism: "Organisms",
};

function getBehaviorCategory(name: string): string {
  const entry = BEHAVIOR_CATALOG[name];
  if (!entry) return "Other";
  return LEVEL_LABELS[entry.level] ?? "Other";
}

function buildMockData(schema: Record<string, unknown>): Record<string, unknown[]> {
  const orbital = (schema.orbitals as Record<string, unknown>[])?.[0];
  const entity = orbital?.entity as Record<string, unknown> | undefined;
  if (!entity) return {};
  const fields = (entity.fields as Record<string, unknown>[]) ?? [];
  const entityName = entity.name as string;

  // Use entity instances if available (behaviors like isometric-canvas seed real data)
  const instances = entity.instances as Record<string, unknown>[] | undefined;
  if (instances && instances.length > 0) {
    return { [entityName]: instances };
  }

  // Generate synthetic mock data from field definitions
  const items = Array.from({ length: 10 }, (_, i) => {
    const idx = i + 1;
    const item: Record<string, unknown> = { id: String(idx) };
    for (const f of fields) {
      const fname = f.name as string;
      if (fname === "id") continue;
      const ftype = f.type as string;
      if (ftype === "string") item[fname] = `${entityName} ${fname.charAt(0).toUpperCase() + fname.slice(1)} ${idx}`;
      else if (ftype === "number") item[fname] = idx * 10;
      else if (ftype === "boolean") item[fname] = idx % 2 === 0;
      else item[fname] = f.default ?? null;
    }
    return item;
  });
  return { [entityName]: items };
}

/**
 * When mock data exists for a trait's linked entity, adjust the schema so
 * the state machine starts in a data-displaying state instead of the empty state.
 *
 * Many behaviors define two INIT handlers: one from the "empty" state (shows
 * placeholder UI) and one from a data state like "hasItems" (shows entity list).
 * The playground generates mock data, so we want to start in the data state.
 *
 * Logic: for each trait whose linkedEntity has mock data, find a non-initial
 * state that also handles INIT. If found, make it the initial state.
 */
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

      // Find current initial state
      const initialStateName =
        (states.find((s) => s.isInitial)?.name as string) ??
        (states[0]?.name as string);
      if (!initialStateName) return trait;

      // Find a non-initial state that also handles INIT
      const dataState = states.find((s) => {
        const name = s.name as string;
        if (name === initialStateName) return false;
        return transitions.some(
          (t) =>
            t.event === "INIT" &&
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

function BehaviorStateMachineInfo({ schema }: { schema: Record<string, unknown> }) {
  const orbital = (schema.orbitals as Record<string, unknown>[])?.[0];
  const traits = (orbital?.traits as Record<string, unknown>[]) ?? [];
  const states: string[] = [];
  const events: string[] = [];
  for (const trait of traits) {
    const sm = trait.stateMachine as Record<string, unknown> | undefined;
    for (const s of (sm?.states as Record<string, unknown>[]) ?? []) states.push(s.name as string);
    for (const t of (sm?.transitions as Record<string, unknown>[]) ?? []) {
      const ev = t.event as string;
      if (ev && !events.includes(ev)) events.push(ev);
    }
  }
  return (
    <HStack gap="lg" className="px-5 py-2.5 border-b border-[var(--color-border)] flex-shrink-0 flex-wrap">
      <HStack gap="sm" align="center">
        <Typography variant="overline" color="muted" weight="bold" className="text-[0.65rem] uppercase tracking-wider">
          States
        </Typography>
        <HStack gap="xs" wrap>
          {states.map((s) => (
            <Badge key={s} variant="default" size="sm" className="text-[0.65rem] font-mono px-1.5 py-0.5 rounded-sm">
              {s}
            </Badge>
          ))}
        </HStack>
      </HStack>
      <HStack gap="sm" align="center">
        <Typography variant="overline" color="muted" weight="bold" className="text-[0.65rem] uppercase tracking-wider">
          Events
        </Typography>
        <HStack gap="xs" wrap>
          {events.map((e) => (
            <Badge key={e} variant="primary" size="sm" className="text-[0.65rem] font-mono px-1.5 py-0.5 rounded-sm">
              {e}
            </Badge>
          ))}
        </HStack>
      </HStack>
    </HStack>
  );
}

// ─── Code Panel ───────────────────────────────────────────────────────────────

type CodeTab = "source" | "schema";

function CodePanel({ entry }: { entry: BehaviorEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<CodeTab>("source");

  const schemaJson = JSON.stringify(entry.schema, null, 2);
  const hasSource = entry.source.trim().length > 0;

  const content = activeTab === "source" && hasSource ? entry.source : schemaJson;
  const lang = activeTab === "source" ? "typescript" : "json";

  return (
    <VStack className="flex-shrink-0 border-t border-[var(--color-border)]">
      <Button
        variant="ghost"
        className="flex items-center gap-2 w-full px-5 py-2 rounded-none justify-start"
        onClick={() => setExpanded((v) => !v)}
      >
        <Icon icon={Code} size={14} />
        <Typography as="span" variant="caption" className="text-inherit">Code</Typography>
        <Badge variant="primary" size="sm" className="ml-auto text-[0.6rem] px-2 py-0.5 rounded-full capitalize tracking-tight">
          {entry.level}
        </Badge>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </Button>
      {expanded && (
        <VStack>
          <HStack className="border-b border-[var(--color-border)]">
            {hasSource && (
              <Button
                variant="ghost"
                size="sm"
                className={`px-4 py-1.5 rounded-none text-[0.7rem] font-semibold uppercase tracking-wide border-b-2 ${
                  activeTab === "source"
                    ? "border-b-[var(--color-primary)]"
                    : "border-b-transparent"
                }`}
                onClick={() => setActiveTab("source")}
              >
                Source (.ts)
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={`px-4 py-1.5 rounded-none text-[0.7rem] font-semibold uppercase tracking-wide border-b-2 ${
                activeTab === "schema"
                  ? "border-b-[var(--color-primary)]"
                  : "border-b-transparent"
              }`}
              onClick={() => setActiveTab("schema")}
            >
              Schema (.orb)
            </Button>
          </HStack>
          <Box className="max-h-[400px] overflow-auto">
            <Typography
              as="pre"
              variant="small"
              className="m-0 px-5 py-4 font-mono leading-relaxed whitespace-pre"
              style={{ tabSize: 2 }}
              data-language={lang}
            >
              <Typography as="code" color="inherit" className="p-0 border-none">
                {content}
              </Typography>
            </Typography>
          </Box>
        </VStack>
      )}
    </VStack>
  );
}

function BehaviorsTab({ initialSelected }: { initialSelected?: string | null }) {
  const [selected, setSelected] = useState(
    initialSelected && BEHAVIOR_CATALOG[initialSelected] ? initialSelected : "std-cart"
  );
  const [previewKey, setPreviewKey] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState("wireframe");
  const [selectedMode, setSelectedMode] = useState<"light" | "dark">("light");
  const [useMockData, setUseMockData] = useState(true);
  const [rt, setRt] = useState<RuntimeDebuggerComponents | null>(null);

  // Load runtime for RuntimeDebugger
  useEffect(() => {
    loadDebuggerRuntime().then(setRt).catch(() => { /* handled by OrbPreview */ });
  }, []);

  const entry = BEHAVIOR_CATALOG[selected] ?? null;
  const schema = (entry?.schema as Record<string, unknown>) ?? null;
  const mockData = schema ? buildMockData(schema) : {};
  const adjustedSchema = useMockData && schema ? adjustSchemaForMockData(schema, mockData) : schema;

  const appliedTheme = `${selectedTheme}-${selectedMode}`;

  const handleSelect = useCallback((name: string) => {
    // Clear stale portal content before remounting the preview.
    // The portal root sits outside the keyed OrbitalPreview, so React
    // doesn't destroy it on remount. Without this, the previous behavior's
    // modal/slot content persists visually.
    const portal = document.getElementById('ui-slot-portal-root');
    if (portal) portal.innerHTML = '';
    setSelected(name);
    setPreviewKey((k) => k + 1);
  }, []);

  const handleModeToggle = useCallback(() => {
    setSelectedMode((m) => (m === "light" ? "dark" : "light"));
  }, []);

  const handleMockDataToggle = useCallback(() => {
    setUseMockData((v) => !v);
    setPreviewKey((k) => k + 1);
  }, []);

  return (
    <HStack className="h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] min-h-[600px] overflow-hidden">
      <Picker items={BEHAVIOR_LIST} selected={selected} onSelect={handleSelect} getCategory={getBehaviorCategory} />
      <VStack className="flex-1 min-h-0 overflow-hidden">
        <HStack align="center" justify="between" className="gap-4 px-5 py-3 border-b border-[var(--color-border)] flex-shrink-0">
          <VStack className="flex-1 min-w-0">
            <Typography variant="body2" color="primary" weight="semibold" className="text-[0.9rem] font-mono">
              {selected}
            </Typography>
            {entry && (
              <Typography variant="caption" color="muted" className="text-[0.8rem] mt-0.5">
                {entry.description}
              </Typography>
            )}
          </VStack>
          <ThemeControls
            theme={selectedTheme}
            mode={selectedMode}
            onThemeChange={setSelectedTheme}
            onModeToggle={handleModeToggle}
          />
        </HStack>
        {schema && <BehaviorStateMachineInfo schema={schema} />}
        {schema && (
          <HStack align="center" className="px-5 py-1.5 border-b border-[var(--color-border)] flex-shrink-0">
            <Box className="ml-auto">
              <Checkbox
                checked={useMockData}
                onChange={handleMockDataToggle}
                label="Auto-fill initial state"
              />
            </Box>
          </HStack>
        )}
        <Box
          className="flex-[1_1_0] h-0 overflow-x-hidden overflow-y-auto relative"
          style={{
            transform: 'translateZ(0)',
            backgroundColor: 'var(--color-background, #ffffff)',
            color: 'var(--color-foreground, #18181b)',
            fontFamily: 'var(--font-family, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
            lineHeight: 'var(--line-height, 1.6)',
            letterSpacing: 'var(--letter-spacing, -0.01em)',
            fontWeight: 'var(--font-weight-normal, 400)',
            WebkitFontSmoothing: 'antialiased',
            transition: 'background-color 0.2s, color 0.2s',
          }}
          data-theme={appliedTheme}
        >
          {/* Pre-create portal root inside the preview box so UISlotRenderer's
              getOrCreatePortalRoot() finds it here instead of on document.body.
              This keeps theme CSS variables in scope. The portal root is a
              zero-height container; portal content uses position:fixed but the
              livePreviewBox has transform:translateZ(0) which constrains fixed
              elements to the preview box boundaries. */}
          <Box
            id="ui-slot-portal-root"
            style={{ position: 'relative', zIndex: 9999, pointerEvents: 'none' }}
            data-theme={appliedTheme}
          />
          {adjustedSchema
            ? <OrbPreview key={previewKey} schema={adjustedSchema} mockData={useMockData ? mockData : {}} height="100%" className="border-0 rounded-none" />
            : (
              <Box className="flex items-center justify-center h-[200px]">
                <Typography color="muted" size="sm">Select a behavior</Typography>
              </Box>
            )
          }
        </Box>
        {entry && <CodePanel entry={entry} />}
        {rt && (
          <Box className="flex-shrink-0 max-h-[240px] overflow-auto border-t border-[var(--color-border)]">
            <rt.RuntimeDebugger
              mode="inline"
              defaultCollapsed
              defaultTab="dispatch"
              schema={schema as Record<string, unknown> | undefined}
            />
          </Box>
        )}
      </VStack>
    </HStack>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: MODULES
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_GROUP: Record<string, string> = {
  math: "Core", str: "Core", array: "Core", object: "Core",
  format: "Core", time: "Core", validate: "Core",
  async: "Async",
  prob: "ML", nn: "ML", tensor: "ML", train: "ML",
};

const MODULE_LIST = Object.keys(MODULE_CATALOG).map((m) => ({
  name: m,
  description: `${Object.keys(MODULE_CATALOG[m]).length} operators`,
}));

function getModuleCategory(name: string): string {
  return MODULE_GROUP[name] ?? "Other";
}

/** Parse the example comment to extract expression and expected value */
function parseExample(example: string): { expr: string; expected: string } {
  // Try "// =>" first (preserves expected value)
  const arrowIdx = example.indexOf("// =>");
  if (arrowIdx > 0) {
    return {
      expr: example.substring(0, arrowIdx).trim(),
      expected: example.substring(arrowIdx + 5).trim(),
    };
  }
  // Fallback: strip any trailing // comment
  const commentIdx = example.lastIndexOf(" //");
  if (commentIdx > 0) {
    return { expr: example.substring(0, commentIdx).trim(), expected: "" };
  }
  return { expr: example.trim(), expected: "" };
}


function ModuleOperatorPanel({ moduleName, opName, op }: {
  moduleName: string;
  opName: string;
  op: { description: string; example: string; returnType: string };
}) {
  const { expr: defaultExpr } = parseExample(op.example);
  const [expr, setExpr] = useState(defaultExpr || `["${opName}"]`);
  const [result, setResult] = useState<{ text: string; isError: boolean } | null>(null);

  const run = useCallback(async () => {
    try {
      const parsed = JSON.parse(expr.trim());
      const { SExpressionEvaluator, createMinimalContext } = await import("@almadar/evaluator");
      const evaluator = new SExpressionEvaluator();
      const ctx = createMinimalContext({}, {}, "initial");
      const value = evaluator.evaluate(parsed, ctx);
      const formatted = value === null ? "null"
        : value === undefined ? "undefined"
        : typeof value === "object" ? JSON.stringify(value, null, 2)
        : String(value);
      setResult({ text: formatted, isError: false });
    } catch (e) {
      setResult({ text: (e as Error).message, isError: true });
    }
  }, [expr, opName]);

  // Run on first load with the default example
  useEffect(() => {
    if (defaultExpr) run();
  }, [opName]);

  return (
    <VStack gap="md" className="p-6 flex-1">
      <HStack gap="md" align="center">
        <Typography variant="body" color="primary" weight="semibold" className="font-mono">
          {opName}
        </Typography>
        <Typography variant="caption" color="muted" className="font-mono">
          {op.returnType}
        </Typography>
      </HStack>
      <Typography variant="body2" color="muted" className="m-0">
        {op.description}
      </Typography>

      <HStack gap="sm" align="start">
        <Textarea
          className="flex-1 font-mono text-[0.8rem] px-3 py-2 resize-none"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          rows={2}
          spellCheck={false}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); } }}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={run}
          className="rounded-md whitespace-nowrap"
        >
          Run
        </Button>
      </HStack>

      <Box className="flex-1 min-h-[120px] max-h-[300px] overflow-auto rounded-lg border border-[var(--color-border)]">
        {result
          ? (
            <Typography
              as="pre"
              color={result.isError ? "error" : "primary"}
              variant="small"
              className="m-0 p-4 font-mono leading-relaxed whitespace-pre-wrap break-words"
            >
              {result.text}
            </Typography>
          )
          : (
            <Box className="flex items-center justify-center h-full">
              <Typography color="muted" size="sm">Press Run to execute</Typography>
            </Box>
          )
        }
      </Box>
    </VStack>
  );
}

function ModuleDetail({ moduleName }: { moduleName: string }) {
  const ops = MODULE_CATALOG[moduleName] ?? {};
  const opNames = Object.keys(ops);
  const [selectedOp, setSelectedOp] = useState(opNames[0] ?? "");

  // Reset selection when module changes
  useEffect(() => {
    setSelectedOp(Object.keys(MODULE_CATALOG[moduleName] ?? {})[0] ?? "");
  }, [moduleName]);

  return (
    <HStack className="flex-1 overflow-hidden">
      {/* Op list */}
      <VStack className="w-[220px] flex-shrink-0 border-r border-[var(--color-border)] overflow-y-auto">
        <Typography
          variant="overline"
          color="muted"
          weight="bold"
          className="text-[0.65rem] uppercase tracking-wider px-3.5 pt-3 pb-1.5"
        >
          {moduleName} operators
        </Typography>
        {opNames.map((op) => (
          <Box
            key={op}
            className={`flex flex-col py-1.5 px-3.5 cursor-pointer text-left transition-colors duration-100 ${
              op === selectedOp
                ? "border-l-2 border-l-[var(--color-primary)]"
                : ""
            }`}
            onClick={() => setSelectedOp(op)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') setSelectedOp(op); }}
          >
            <Typography variant="caption" color={op === selectedOp ? "primary" : "muted"} className="font-mono">
              {op}
            </Typography>
            <Typography variant="caption" color="muted" className="text-[0.65rem] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
              {ops[op].description}
            </Typography>
          </Box>
        ))}
      </VStack>

      {/* Op detail + live execution */}
      <VStack className="flex-1 overflow-y-auto">
        {selectedOp && ops[selectedOp]
          ? <ModuleOperatorPanel key={selectedOp} moduleName={moduleName} opName={selectedOp} op={ops[selectedOp]} />
          : (
            <Box className="flex items-center justify-center h-full">
              <Typography color="muted" size="sm">Select an operator</Typography>
            </Box>
          )
        }
      </VStack>
    </HStack>
  );
}

function ModulesTab({ initialSelected }: { initialSelected?: string | null }) {
  const [selected, setSelected] = useState(
    initialSelected && MODULE_CATALOG[initialSelected] ? initialSelected : "math"
  );

  return (
    <HStack className="h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] min-h-[600px] overflow-hidden">
      <Picker items={MODULE_LIST} selected={selected} onSelect={setSelected} getCategory={getModuleCategory} />
      <VStack className="flex-1 min-h-0 overflow-hidden">
        <HStack className="px-5 py-3 border-b border-[var(--color-border)] flex-shrink-0">
          <VStack>
            <Typography variant="body2" color="primary" weight="semibold" className="text-[0.9rem] font-mono">
              {selected}
            </Typography>
            <Typography variant="caption" color="muted" className="text-[0.8rem] mt-0.5">
              {Object.keys(MODULE_CATALOG[selected] ?? {}).length} operators - executed live via the Orbital evaluator
            </Typography>
          </VStack>
        </HStack>
        <ModuleDetail moduleName={selected} />
      </VStack>
    </HStack>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

type PlaygroundTab = "behaviors" | "modules";

/** Read ?tab= and ?selected= from the URL so tests can deep-link */
function useUrlParams(): { tab: PlaygroundTab; selected: string | null } {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const rawTab = params?.get("tab");
  const tab: PlaygroundTab = rawTab === "modules" ? "modules" : "behaviors";
  return { tab, selected: params?.get("selected") ?? null };
}

const PAGE_TABS: TabItem[] = [
  { id: "behaviors", label: "Behaviors" },
  { id: "modules", label: "Modules" },
];

function PlaygroundInner(): ReactNode {
  const urlParams = useUrlParams();
  const [activeTab, setActiveTab] = useState<PlaygroundTab>(urlParams.tab);

  return (
    <>
      <Box className="py-12 pb-8 border-b border-[var(--color-border)]">
        <Box className="container">
          <Heading as="h1" className="text-[2rem] font-extrabold mb-2">
            Playground
          </Heading>
          <Typography variant="body" color="muted" className="text-[1.05rem] m-0">
            Explore standard behaviors and modules - rendered live by the Orbital runtime.
          </Typography>
          <Box className="mt-5">
            <Tabs
              items={PAGE_TABS}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as PlaygroundTab)}
              variant="pills"
              className="gap-1"
            />
          </Box>
        </Box>
      </Box>

      <Box as="main" className="min-h-[calc(100vh-200px)] flex flex-col">
        <BrowserOnly fallback={
          <Box className="p-16 text-center">
            <Typography color="muted">Loading...</Typography>
          </Box>
        }>
          {() => activeTab === "behaviors"
            ? <BehaviorsTab initialSelected={urlParams.tab === "behaviors" ? urlParams.selected : null} />
            : <ModulesTab initialSelected={urlParams.tab === "modules" ? urlParams.selected : null} />
          }
        </BrowserOnly>
      </Box>
    </>
  );
}

export default function PlaygroundContent(): ReactNode {
  return <PlaygroundInner />;
}
