import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { ReactNode } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import {
  Search,
  Sun,
  Moon,
  Code,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
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
  Tabs,
  Icon,
  Textarea,
  Card,
} from "@almadar/ui";
import type { TabItem } from "@almadar/ui";
import { OrbPreview } from "@almadar/ui/runtime";

// Load all theme CSS so data-theme attributes resolve to actual variables
import "@almadar/ui/themes/index.css";

// ─── Mini Behavior Glyph (inline, no external import) ────────────────────────
// A tiny (32x32) SVG glyph that encodes behavior properties as visual marks:
// core shape = persistence, dots = field count, ring count = state count.

const LEVEL_COLORS: Record<string, string> = {
  atom: "#14b8a6",
  molecule: "#6366f1",
  organism: "#f59e0b",
};

function BehaviorMiniGlyph({ level, fieldCount, stateCount, persistence }: {
  level: string;
  fieldCount: number;
  stateCount: number;
  persistence: string;
}) {
  const color = LEVEL_COLORS[level] ?? "#14b8a6";
  const cx = 16;
  const cy = 16;
  const coreR = 4;
  const ringCount = Math.min(stateCount, 3);
  const spokeCount = Math.min(fieldCount, 8);

  return (
    <svg viewBox="0 0 32 32" width={32} height={32} className="inline-block">
      {/* Core shape */}
      {persistence === "runtime" ? (
        <circle cx={cx} cy={cy} r={coreR} fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 1" opacity={0.9} />
      ) : persistence === "singleton" ? (
        <rect
          x={cx - coreR * 0.7} y={cy - coreR * 0.7}
          width={coreR * 1.4} height={coreR * 1.4}
          transform={`rotate(45 ${cx} ${cy})`}
          fill={color} fillOpacity={0.3}
          stroke={color} strokeWidth={1}
        />
      ) : (
        <circle cx={cx} cy={cy} r={coreR} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1.2} />
      )}

      {/* State rings */}
      {Array.from({ length: ringCount }, (_, i) => (
        <circle
          key={`ring-${i}`}
          cx={cx} cy={cy} r={coreR + (i + 1) * 2.5}
          fill="none" stroke={color} strokeWidth={0.6}
          opacity={0.5 - i * 0.12}
        />
      ))}

      {/* Field spokes (small dots at edge) */}
      {Array.from({ length: spokeCount }, (_, i) => {
        const angle = (Math.PI * 2 * i) / spokeCount - Math.PI / 2;
        const r = coreR + ringCount * 2.5 + 2;
        return (
          <circle
            key={`spoke-${i}`}
            cx={cx + r * Math.cos(angle)}
            cy={cy + r * Math.sin(angle)}
            r={0.8}
            fill={color}
            opacity={0.6}
          />
        );
      })}
    </svg>
  );
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

// ─── Glyph helper ─────────────────────────────────────────────────────────────

function schemaToGlyphProps(entry: BehaviorEntry) {
  const schema = entry.schema as Record<string, unknown>;
  const orbital = (schema?.orbitals as Record<string, unknown>[])?.[0];
  const entity = orbital?.entity as Record<string, unknown> | undefined;
  const fields = (entity?.fields as unknown[])?.length ?? 0;
  const traits = (orbital?.traits as Record<string, unknown>[]) ?? [];
  let stateCount = 0;
  const effectTypes: string[] = [];
  for (const trait of traits) {
    const sm = trait.stateMachine as Record<string, unknown> | undefined;
    stateCount += ((sm?.states as unknown[])?.length ?? 0);
    for (const t of ((sm?.transitions as Record<string, unknown>[]) ?? [])) {
      for (const eff of ((t.effects as unknown[][]) ?? [])) {
        const effType = (eff as string[])?.[0];
        if (effType && !effectTypes.includes(effType)) effectTypes.push(effType);
      }
    }
  }
  const persistence = (entity?.persistence as string) ?? "persistent";
  return { fieldCount: fields, stateCount, effectTypes, persistence, level: entry.level };
}

// ─── State machine extraction ─────────────────────────────────────────────────

function extractStateMachineInfo(schema: Record<string, unknown>): { stateCount: number; eventCount: number } {
  const orbital = (schema.orbitals as Record<string, unknown>[])?.[0];
  const traits = (orbital?.traits as Record<string, unknown>[]) ?? [];
  let stateCount = 0;
  const events: string[] = [];
  for (const trait of traits) {
    const sm = trait.stateMachine as Record<string, unknown> | undefined;
    stateCount += ((sm?.states as unknown[])?.length ?? 0);
    for (const t of (sm?.transitions as Record<string, unknown>[]) ?? []) {
      const ev = t.event as string;
      if (ev && !events.includes(ev)) events.push(ev);
    }
  }
  return { stateCount, eventCount: events.length };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA: BEHAVIORS
// ═══════════════════════════════════════════════════════════════════════════════

const BEHAVIOR_LIST = Object.values(BEHAVIOR_CATALOG).map((b: BehaviorEntry) => ({
  name: b.name,
  description: b.description || "",
}));

const LEVEL_LABELS: Record<string, string> = {
  atom: "ATOMS",
  molecule: "MOLECULES",
  organism: "ORGANISMS",
};

// Order: organisms first, then molecules, then atoms
const LEVEL_ORDER: Record<string, number> = {
  ORGANISMS: 0,
  MOLECULES: 1,
  ATOMS: 2,
};

function getBehaviorCategory(name: string): string {
  const entry = BEHAVIOR_CATALOG[name];
  if (!entry) return "Other";
  return LEVEL_LABELS[entry.level] ?? "Other";
}


// ─── Behavior Composition (from source code, not schema) ─────────────────────

/** Convert camelCase function name to kebab behavior name: stdCart -> std-cart */
function fnToKebab(fn: string): string {
  return fn.replace(/^std/, 'std-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Extract which std* behaviors a behavior composes by parsing its source code */
function extractComposedBehaviors(entry: BehaviorEntry): string[] {
  const calls = (entry.source.match(/\bstd[A-Z]\w+\s*\(/g) ?? [])
    .map((c: string) => c.replace(/\s*\(/, ''))
    .map((c: string) => fnToKebab(c))
    .filter((c: string) => c !== entry.name && BEHAVIOR_CATALOG[c]);
  return [...new Set(calls)];
}

// ─── Composition View ────────────────────────────────────────────────────────

function CompositionView({ entry, onSelect }: {
  entry: BehaviorEntry;
  onSelect: (name: string) => void;
}) {
  const children = useMemo(() => extractComposedBehaviors(entry), [entry]);
  const isAtom = entry.level === 'atom';

  // For each child, also get its children (one level deeper)
  const childEntries = useMemo(() => children.map(name => {
    const child = BEHAVIOR_CATALOG[name];
    if (!child) return null;
    const grandchildren = extractComposedBehaviors(child);
    return { name, level: child.level, description: child.description, grandchildren };
  }).filter(Boolean) as { name: string; level: string; description: string; grandchildren: string[] }[], [children]);

  return (
    <VStack className="p-6 gap-6 h-full overflow-y-auto">
      {/* Header */}
      <VStack gap="sm">
        <HStack gap="sm" align="center">
          <Badge variant={isAtom ? 'info' : entry.level === 'molecule' ? 'primary' : 'warning'} size="sm">
            {entry.level}
          </Badge>
          <Typography variant="h3" className="font-mono">{entry.name}</Typography>
        </HStack>
        <Typography variant="body2" color="muted">{entry.description}</Typography>
      </VStack>

      {isAtom ? (
        <VStack gap="sm">
          <Typography variant="body2" color="muted">
            This is an atom. It does not compose other behaviors. It is a self-contained state machine that can be used as a building block by molecules and organisms.
          </Typography>
        </VStack>
      ) : (
        <VStack gap="lg">
          {/* Composition label */}
          <Typography variant="body2" weight="semibold">
            Composes {children.length} behavior{children.length !== 1 ? 's' : ''}:
          </Typography>

          {/* Child behavior cards */}
          <VStack gap="md">
            {childEntries.map((child) => (
              <Card
                key={child.name}
                className="p-4 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                onClick={() => onSelect(child.name)}
              >
                <VStack gap="sm">
                  <HStack gap="sm" align="center" justify="between">
                    <HStack gap="sm" align="center">
                      <Badge
                        variant={child.level === 'atom' ? 'info' : child.level === 'molecule' ? 'primary' : 'warning'}
                        size="sm"
                      >
                        {child.level}
                      </Badge>
                      <Typography variant="body" weight="semibold" className="font-mono text-[0.85rem]">
                        {child.name}
                      </Typography>
                    </HStack>
                    <Typography variant="caption" color="muted" className="text-[0.7rem]">
                      click to view &#8594;
                    </Typography>
                  </HStack>
                  <Typography variant="caption" color="muted">{child.description}</Typography>
                  {child.grandchildren.length > 0 && (
                    <HStack gap="xs" className="flex-wrap">
                      <Typography variant="caption" color="muted" className="text-[0.65rem]">composes:</Typography>
                      {child.grandchildren.map(gc => (
                        <Badge key={gc} variant="neutral" size="sm" className="font-mono text-[0.6rem]">{gc}</Badge>
                      ))}
                    </HStack>
                  )}
                </VStack>
              </Card>
            ))}
          </VStack>
        </VStack>
      )}
    </VStack>
  );
}

// Mock data + state machine adjustment now live in @almadar/ui/runtime as
// `prepareSchemaForPreview` and are enabled via `<OrbPreview autoMock />`.
// Both the docs MDX path and this playground render schemas the same way.

// ─── Code Panel (for browser chrome code toggle) ──────────────────────────────

type CodeTab = "source" | "schema";

function CodePanel({ entry }: { entry: BehaviorEntry }) {
  const [activeTab, setActiveTab] = useState<CodeTab>("source");

  const schemaJson = JSON.stringify(entry.schema, null, 2);
  const hasSource = entry.source.trim().length > 0;

  const content = activeTab === "source" && hasSource ? entry.source : schemaJson;
  const lang = activeTab === "source" ? "typescript" : "json";

  return (
    <VStack className="h-full">
      <HStack className="border-b border-[var(--color-border)] flex-shrink-0">
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
      <Box className="flex-1 overflow-auto">
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
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BEHAVIOR BROWSER (Left Panel)
// ═══════════════════════════════════════════════════════════════════════════════

function BehaviorBrowser({
  items,
  selected,
  onSelect,
  collapsed,
  onToggleCollapse,
}: {
  items: { name: string; description: string }[];
  selected: string;
  onSelect: (name: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [query, setQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const filtered = items.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.description.toLowerCase().includes(query.toLowerCase())
  );

  const byCategory: Record<string, typeof items> = {};
  for (const b of filtered) {
    const cat = getBehaviorCategory(b.name);
    (byCategory[cat] ||= []).push(b);
  }
  const sortedCategories = Object.keys(byCategory).sort(
    (a, b) => (LEVEL_ORDER[a] ?? 99) - (LEVEL_ORDER[b] ?? 99)
  );

  const toggleSection = (cat: string) => {
    setCollapsedSections((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (collapsed) {
    return (
      <VStack className="w-[48px] flex-shrink-0 border-r border-[var(--color-border)] items-center pt-3">
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="w-8 h-8 p-0">
          <Icon icon={PanelLeft} size="sm" />
        </Button>
      </VStack>
    );
  }

  return (
    <VStack className="w-[320px] flex-shrink-0 border-r border-[var(--color-border)]">
      <HStack gap="sm" align="center" className="px-3 py-2.5 border-b border-[var(--color-border)] flex-shrink-0">
        <Icon icon={Search} size="sm" className="flex-shrink-0 text-muted-foreground" />
        <Input
          placeholder="Search behaviors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-xs w-full p-0 shadow-none ring-0 focus:ring-0"
        />
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="w-7 h-7 p-0 flex-shrink-0">
          <Icon icon={PanelLeftClose} size="sm" />
        </Button>
      </HStack>
      <Box className="overflow-y-auto py-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {sortedCategories.map((cat) => {
          const isCollapsed = collapsedSections[cat] ?? false;
          return (
            <Box key={cat} className="mb-0.5">
              <Box
                className="flex items-center justify-between cursor-pointer px-3.5 pt-2.5 pb-1 hover:bg-[var(--color-muted)]/10"
                onClick={() => toggleSection(cat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") toggleSection(cat); }}
              >
                <Typography
                  variant="overline"
                  color="muted"
                  weight="bold"
                  className="text-[0.6rem] uppercase tracking-wider"
                >
                  {cat}
                </Typography>
                <HStack gap="xs" align="center">
                  <Typography variant="caption" color="muted" className="text-[0.6rem]">
                    {byCategory[cat].length}
                  </Typography>
                  {isCollapsed
                    ? <ChevronDown size={12} className="text-muted-foreground" />
                    : <ChevronUp size={12} className="text-muted-foreground" />
                  }
                </HStack>
              </Box>
              {!isCollapsed && byCategory[cat].map((b) => {
                const entry = BEHAVIOR_CATALOG[b.name];
                const glyphProps = entry ? schemaToGlyphProps(entry) : null;
                const isSelected = b.name === selected;
                return (
                  <HStack
                    key={b.name}
                    align="center"
                    className={`w-full py-1.5 px-3.5 cursor-pointer transition-colors duration-100 ${
                      isSelected
                        ? "border-l-2 border-l-teal-500 bg-teal-500/5"
                        : "border-l-2 border-l-transparent hover:bg-[var(--color-muted)]/5"
                    }`}
                    onClick={() => onSelect(b.name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") onSelect(b.name); }}
                  >
                    <Typography
                      variant="body2"
                      color={isSelected ? "primary" : "inherit"}
                      weight="medium"
                      className="text-[0.78rem] font-mono flex-1 min-w-0 truncate"
                    >
                      {b.name.replace(/^std-/, "")}
                    </Typography>
                    {glyphProps && (
                      <Box className="flex-shrink-0 ml-2">
                        <BehaviorMiniGlyph
                          level={glyphProps.level}
                          fieldCount={glyphProps.fieldCount}
                          stateCount={glyphProps.stateCount}
                          persistence={glyphProps.persistence}
                        />
                      </Box>
                    )}
                  </HStack>
                );
              })}
            </Box>
          );
        })}
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
// BEHAVIORS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function BehaviorsTab({ initialSelected, selectedTheme, selectedMode, onThemeChange, onModeToggle }: {
  initialSelected?: string | null;
  selectedTheme: string;
  selectedMode: "light" | "dark";
  onThemeChange: (t: string) => void;
  onModeToggle: () => void;
}) {
  const [selected, setSelected] = useState(
    initialSelected && BEHAVIOR_CATALOG[initialSelected] ? initialSelected : "std-cart"
  );
  const [previewKey, setPreviewKey] = useState(0);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [smBarExpanded, setSmBarExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "composition">("preview");

  const entry = BEHAVIOR_CATALOG[selected] ?? null;
  const schema = (entry?.schema as Record<string, unknown>) ?? null;
  // Stringify at the boundary so OrbPreview parses + validates the JSON.
  // Using the string overload avoids any unsafe shape cast.
  const schemaJson = useMemo(() => (schema ? JSON.stringify(schema) : null), [schema]);
  const smInfo = schema ? extractStateMachineInfo(schema) : null;

  const appliedTheme = `${selectedTheme}-${selectedMode}`;

  const handleSelect = useCallback((name: string) => {
    const portal = document.getElementById("ui-slot-portal-root");
    if (portal) portal.innerHTML = "";
    setSelected(name);
    setPreviewKey((k) => k + 1);
    setShowCode(false);
  }, []);

  const toggleCode = useCallback(() => {
    setShowCode((v) => !v);
  }, []);

  return (
    <HStack className="flex-1 min-h-0 overflow-hidden">
      {/* Left: Behavior Browser */}
      <BehaviorBrowser
        items={BEHAVIOR_LIST}
        selected={selected}
        onSelect={handleSelect}
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelCollapsed((v) => !v)}
      />

      {/* Right: Preview Panel */}
      <VStack className="flex-1 min-h-0 overflow-hidden">
        {/* View Toggle */}
        <HStack align="center" justify="between" className="px-4 py-2 border-b border-[var(--color-border)] flex-shrink-0">
          <HStack gap="xs" align="center">
            {entry && (
              <Badge variant="primary" size="sm" className="text-[0.6rem] px-2 py-0.5 rounded-full capitalize tracking-tight">
                {entry.level}
              </Badge>
            )}
            {entry && (
              <Typography variant="caption" color="muted" className="text-[0.75rem] ml-1">
                {entry.description}
              </Typography>
            )}
          </HStack>
          <HStack gap="xs" align="center">
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="text-[0.7rem] px-3 py-1 rounded-md"
            >
              Live Preview
            </Button>
            <Button
              variant={viewMode === "composition" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("composition")}
              className="text-[0.7rem] px-3 py-1 rounded-md"
            >
              Composition Map
            </Button>
          </HStack>
        </HStack>

        {/* Browser Chrome */}
        <Box className="bg-[#1a1a2e] border-x border-t border-[var(--color-border)] flex-shrink-0" style={{ borderTopLeftRadius: "0.5rem", borderTopRightRadius: "0.5rem" }}>
          <HStack className="px-3 py-2 gap-2" align="center">
            <HStack gap="xs">
              <Box className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <Box className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <Box className="w-3 h-3 rounded-full bg-[#28c840]" />
            </HStack>
            <HStack gap="xs" align="center">
              <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-gray-200">
                <Icon icon={ArrowLeft} size="xs" />
              </Button>
              <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-gray-200">
                <Icon icon={ArrowRight} size="xs" />
              </Button>
              <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-gray-200">
                <Icon icon={RotateCcw} size="xs" />
              </Button>
            </HStack>
            <Box className="flex-1 bg-[#0d0d1a] rounded-md px-3 py-1">
              <Typography variant="caption" className="font-mono text-gray-500 text-[0.7rem]">
                orb://std-{selected.replace(/^std-/, "")}
              </Typography>
            </Box>
            <HStack gap="xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCode}
                className={`w-6 h-6 p-0 ${showCode ? "text-teal-400" : "text-gray-400 hover:text-gray-200"}`}
              >
                <Icon icon={Code} size="xs" />
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Main content area */}
        {showCode && entry ? (
          <Box className="flex-[1_1_0] h-0 overflow-hidden border-x border-[var(--color-border)]">
            <CodePanel entry={entry} />
          </Box>
        ) : viewMode === "composition" ? (
          <Box className="flex-[1_1_0] h-0 overflow-auto border-x border-[var(--color-border)]">
            {entry ? (
              <CompositionView entry={entry} onSelect={handleSelect} />
            ) : (
              <Box className="flex items-center justify-center h-full">
                <Typography color="muted">Select a behavior to view its composition</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            className="flex-[1_1_0] h-0 overflow-x-hidden overflow-y-auto relative border-x border-[var(--color-border)]"
            style={{
              transform: "translateZ(0)",
              backgroundColor: "var(--color-background, #ffffff)",
              color: "var(--color-foreground, #18181b)",
              fontFamily: 'var(--font-family, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
              lineHeight: "var(--line-height, 1.6)",
              letterSpacing: "var(--letter-spacing, -0.01em)",
              fontWeight: "var(--font-weight-normal, 400)",
              WebkitFontSmoothing: "antialiased",
              transition: "background-color 0.2s, color 0.2s",
            }}
            data-theme={appliedTheme}
          >
            <Box
              id="ui-slot-portal-root"
              style={{ position: "relative", zIndex: 9999, pointerEvents: "none" }}
              data-theme={appliedTheme}
            />
            {schemaJson ? (
              <OrbPreview
                key={previewKey}
                schema={schemaJson}
                autoMock
                height="100%"
                className="border-0 rounded-none"
              />
            ) : (
              <Box className="flex items-center justify-center h-[200px]">
                <Typography color="muted" size="sm">Select a behavior</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* State Machine Bar (collapsible, closed by default) */}
        {smInfo && (
          <Box className="border-x border-b border-[var(--color-border)] flex-shrink-0" style={{ borderBottomLeftRadius: "0.5rem", borderBottomRightRadius: "0.5rem" }}>
            <Box
              className="flex items-center justify-between px-4 py-1.5 cursor-pointer bg-[var(--color-muted)]/5 hover:bg-[var(--color-muted)]/10 transition-colors"
              onClick={() => setSmBarExpanded((v) => !v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") setSmBarExpanded((v) => !v); }}
            >
              <Typography variant="caption" color="muted" className="text-[0.7rem] font-mono">
                State Machine: {smInfo.stateCount} states, {smInfo.eventCount} events
              </Typography>
              {smBarExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </Box>
            {smBarExpanded && schema && (
              <StateMachineDetail schema={schema} />
            )}
          </Box>
        )}
      </VStack>
    </HStack>
  );
}

// ─── State Machine Detail (expanded) ──────────────────────────────────────────

function StateMachineDetail({ schema }: { schema: Record<string, unknown> }) {
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
    <HStack gap="lg" className="px-4 py-2.5 border-t border-[var(--color-border)] flex-wrap">
      <HStack gap="sm" align="center">
        <Typography variant="overline" color="muted" weight="bold" className="text-[0.6rem] uppercase tracking-wider">
          States
        </Typography>
        <HStack gap="xs" wrap>
          {states.map((s) => (
            <Badge key={s} variant="default" size="sm" className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded-sm">
              {s}
            </Badge>
          ))}
        </HStack>
      </HStack>
      <HStack gap="sm" align="center">
        <Typography variant="overline" color="muted" weight="bold" className="text-[0.6rem] uppercase tracking-wider">
          Events
        </Typography>
        <HStack gap="xs" wrap>
          {events.map((e) => (
            <Badge key={e} variant="primary" size="sm" className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded-sm">
              {e}
            </Badge>
          ))}
        </HStack>
      </HStack>
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

function parseExample(example: string): { expr: string; expected: string } {
  const arrowIdx = example.indexOf("// =>");
  if (arrowIdx > 0) {
    return {
      expr: example.substring(0, arrowIdx).trim(),
      expected: example.substring(arrowIdx + 5).trim(),
    };
  }
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
        {result ? (
          <Typography
            as="pre"
            color={result.isError ? "error" : "primary"}
            variant="small"
            className="m-0 p-4 font-mono leading-relaxed whitespace-pre-wrap break-words"
          >
            {result.text}
          </Typography>
        ) : (
          <Box className="flex items-center justify-center h-full">
            <Typography color="muted" size="sm">Press Run to execute</Typography>
          </Box>
        )}
      </Box>
    </VStack>
  );
}

function ModuleDetail({ moduleName }: { moduleName: string }) {
  const ops = MODULE_CATALOG[moduleName] ?? {};
  const opNames = Object.keys(ops);
  const [selectedOp, setSelectedOp] = useState(opNames[0] ?? "");

  useEffect(() => {
    setSelectedOp(Object.keys(MODULE_CATALOG[moduleName] ?? {})[0] ?? "");
  }, [moduleName]);

  return (
    <HStack className="flex-col md:flex-row flex-1 overflow-hidden">
      <VStack className="w-full md:w-[220px] flex-shrink-0 max-h-[40vh] md:max-h-none border-b md:border-b-0 md:border-r border-[var(--color-border)] overflow-y-auto">
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
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") setSelectedOp(op); }}
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
    <HStack className="flex-col md:flex-row flex-1 overflow-hidden">
      <VStack className="w-full md:w-[260px] flex-shrink-0 max-h-[40vh] md:max-h-none border-b md:border-b-0 md:border-r border-[var(--color-border)] overflow-hidden">
        <Box className="flex-1 overflow-y-auto py-2">
          {(() => {
            const byCategory: Record<string, typeof MODULE_LIST> = {};
            for (const m of MODULE_LIST) {
              const cat = getModuleCategory(m.name);
              (byCategory[cat] ||= []).push(m);
            }
            return Object.keys(byCategory).sort().map((cat) => (
              <Box key={cat} className="mb-1">
                <Typography
                  variant="overline"
                  color="muted"
                  weight="bold"
                  className="text-[0.65rem] uppercase tracking-wider px-3.5 pt-2.5 pb-1"
                >
                  {cat}
                </Typography>
                {byCategory[cat].map((m) => (
                  <Box
                    key={m.name}
                    className={`flex flex-col w-full text-left py-1.5 px-3.5 cursor-pointer transition-colors duration-100 ${
                      m.name === selected
                        ? "border-l-2 border-l-[var(--color-primary)]"
                        : ""
                    }`}
                    onClick={() => setSelected(m.name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") setSelected(m.name); }}
                  >
                    <Typography
                      variant="body2"
                      color={m.name === selected ? "primary" : "inherit"}
                      weight="medium"
                      className="text-[0.8rem] font-mono"
                    >
                      {m.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="muted"
                      className="text-[0.7rem] mt-0.5"
                    >
                      {m.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ));
          })()}
        </Box>
      </VStack>
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
  const [selectedTheme, setSelectedTheme] = useState("wireframe");
  const [selectedMode, setSelectedMode] = useState<"light" | "dark">("light");

  const handleModeToggle = useCallback(() => {
    setSelectedMode((m) => (m === "light" ? "dark" : "light"));
  }, []);

  return (
    <VStack className="min-h-[calc(100vh-60px)]">
      {/* Page header: title + tabs + controls in natural document flow */}
      <Box className="w-full bg-[var(--color-background)]">
        <Box className="site-container pt-6 pb-0">
          <HStack align="center" justify="between" className="flex-wrap gap-4">
            <VStack gap="xs">
              <Typography variant="h2" className="text-[1.5rem]">Playground</Typography>
              <Typography variant="body2" color="muted">
                Explore standard behaviors and modules rendered live by the Orbital runtime.
              </Typography>
            </VStack>
            <HStack gap="sm" align="center" className="flex-shrink-0">
              <Select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                options={THEME_OPTIONS}
                title="Select theme"
                className="text-xs rounded-md"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModeToggle}
                title={selectedMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
                className="w-8 h-8 p-0 rounded-md"
              >
                {selectedMode === "light" ? <Sun size={14} /> : <Moon size={14} />}
              </Button>
            </HStack>
          </HStack>
          <Box className="mt-4">
            <Tabs
              items={PAGE_TABS}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as PlaygroundTab)}
              variant="underline"
              className="gap-1"
            />
          </Box>
        </Box>
      </Box>

      {/* Main content inside site-container */}
      <Box className="site-container flex-1 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 180px)', minHeight: 500 }}>
        <BrowserOnly fallback={
          <Box className="p-16 text-center">
            <Typography color="muted">Loading...</Typography>
          </Box>
        }>
          {() => activeTab === "behaviors"
            ? (
              <BehaviorsTab
                initialSelected={urlParams.tab === "behaviors" ? urlParams.selected : null}
                selectedTheme={selectedTheme}
                selectedMode={selectedMode}
                onThemeChange={setSelectedTheme}
                onModeToggle={handleModeToggle}
              />
            )
            : <ModulesTab initialSelected={urlParams.tab === "modules" ? urlParams.selected : null} />
          }
        </BrowserOnly>
      </Box>
    </VStack>
  );
}

export default function PlaygroundContent(): ReactNode {
  return <PlaygroundInner />;
}
