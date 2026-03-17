'use client';
/* eslint-disable almadar/require-closed-circuit-props, almadar/organism-extends-entity-display, almadar/organism-no-callback-props, almadar/require-event-bus, almadar/require-translate */
/**
 * UISlotRenderer Component
 *
 * Renders all UI slots. This is the central component that displays
 * content rendered by traits via render_ui effects.
 *
 * Slots are rendered as:
 * - Layout slots: Inline in the page flow (main, sidebar)
 * - Portal slots: Rendered via portals (modal, drawer, toast, etc.)
 * - HUD slots: Fixed position overlays (hud-top, hud-bottom)
 *
 * @packageDocumentation
 */

import React, { Suspense, createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useUISlots,
  type UISlot,
  type SlotContent,
} from "../../context/UISlotContext";
import { Modal } from "../molecules/Modal";
import { Drawer } from "../molecules/Drawer";
import { Toast } from "../molecules/Toast";
import { Box } from "../atoms/Box";
import { Typography } from "../atoms/Typography";
import { cn } from "../../lib/cn";
import { ErrorBoundary } from "../molecules/ErrorBoundary";
import { Skeleton, type SkeletonVariant } from "../molecules/Skeleton";

// Shared renderer imports (synced from orbital-shared/design-system/renderer)
import { isKnownPattern, isPortalSlot, SLOT_DEFINITIONS } from "../../renderer";

// ============================================================================
// Suspense Configuration Context
// ============================================================================

export interface SuspenseConfig {
  /** Enable Suspense boundaries around slot content */
  enabled: boolean;
  /** Custom fallback per slot, overrides default Skeleton variant */
  slotFallbacks?: Partial<Record<UISlot, React.ReactNode>>;
}

const SuspenseConfigContext = createContext<SuspenseConfig>({ enabled: false });

/**
 * Provider for Suspense configuration.
 * When enabled, each UI slot is wrapped in `<ErrorBoundary><Suspense>`.
 */
export function SuspenseConfigProvider({
  config,
  children,
}: {
  config: SuspenseConfig;
  children: React.ReactNode;
}) {
  return React.createElement(
    SuspenseConfigContext.Provider,
    { value: config },
    children,
  );
}
SuspenseConfigProvider.displayName = 'SuspenseConfigProvider';

/** Map slot names to the best Skeleton variant */
const SLOT_SKELETON_MAP: Partial<Record<UISlot, SkeletonVariant>> = {
  main: 'table',
  sidebar: 'card',
  modal: 'form',
  drawer: 'form',
};

function getSlotFallback(slot: UISlot, config: SuspenseConfig): React.ReactNode {
  if (config.slotFallbacks?.[slot]) return config.slotFallbacks[slot];
  const variant = SLOT_SKELETON_MAP[slot] ?? 'text';
  return <Skeleton variant={variant} />;
}

// Pattern component imports
import { PageHeader } from "./PageHeader";
import { DataTable } from "./DataTable";
import { CardGrid } from "./CardGrid";
import { DetailPanel } from "./DetailPanel";
import { MasterDetail } from "./MasterDetail";
import { SearchInput } from "../molecules/SearchInput";
import { EmptyState } from "../molecules/EmptyState";
import { LoadingState } from "../molecules/LoadingState";
import { Breadcrumb } from "../molecules/Breadcrumb";
import { StatCard } from "./StatCard";
import { Form } from "./Form";
import { ButtonGroup } from "../molecules/ButtonGroup";

// Layout pattern imports
import {
  VStackPattern,
  HStackPattern,
  BoxPattern,
  GridPattern,
  CenterPattern,
  SpacerPattern,
  DividerPattern,
} from "./LayoutPatterns";

// Component pattern imports
import {
  ButtonPattern,
  IconButtonPattern,
  LinkPattern,
  TextPattern,
  HeadingPattern,
  BadgePattern,
  AvatarPattern,
  IconPattern,
  ImagePattern,
  CardPattern,
  ProgressBarPattern,
  SpinnerPattern,
  InputPattern,
  TextareaPattern,
  SelectPattern,
  CheckboxPattern,
  RadioPattern,
  LabelPattern,
  AlertPattern,
  TooltipPattern,
  PopoverPattern,
  MenuPattern,
  AccordionPattern,
  ContainerPattern,
  SimpleGridPattern,
  FloatButtonPattern,
} from "./ComponentPatterns";

// Custom pattern import
import { CustomPattern } from "./CustomPattern";

// ============================================================================
// Component Registry
// ============================================================================

/**
 * Maps component names to actual React components.
 * The pattern resolver returns a component name (e.g., "DataTable"),
 * and this registry provides the actual component.
 *
 * Component names match those in orbital-shared/patterns/component-mapping.json
 */
// eslint-disable-next-line almadar/require-display-name
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  // Display patterns
  PageHeader,
  DataTable,
  CardGrid,
  DetailPanel,
  MasterDetail,
  List: DataTable, // List uses DataTable component
  StatCard,
  // Form patterns
  Form,
  ButtonGroup,
  SearchInput,
  // State patterns
  EmptyState,
  LoadingState,
  Breadcrumb,
  // Layout patterns
  VStackPattern,
  HStackPattern,
  BoxPattern,
  GridPattern,
  CenterPattern,
  SpacerPattern,
  DividerPattern,
  // Component patterns - Interactive
  ButtonPattern,
  IconButtonPattern,
  LinkPattern,
  // Component patterns - Display
  TextPattern,
  HeadingPattern,
  BadgePattern,
  AvatarPattern,
  IconPattern,
  ImagePattern,
  CardPattern,
  ProgressBarPattern,
  SpinnerPattern,
  // Component patterns - Form inputs
  InputPattern,
  TextareaPattern,
  SelectPattern,
  CheckboxPattern,
  RadioPattern,
  LabelPattern,
  // Component patterns - Feedback
  AlertPattern,
  TooltipPattern,
  PopoverPattern,
  // Component patterns - Navigation
  MenuPattern,
  AccordionPattern,
  // Component patterns - Layout
  ContainerPattern,
  SimpleGridPattern,
  FloatButtonPattern,
  // Custom pattern
  CustomPattern,
};

/**
 * Maps pattern types to component names.
 * This provides a local fallback when the shared resolver is not initialized.
 * Ideally, this should come from the shared resolver (orbital-shared/patterns/component-mapping.json).
 */
const PATTERN_TO_COMPONENT: Record<string, string> = {
  "page-header": "PageHeader",
  "entity-table": "DataTable",
  "entity-cards": "CardGrid",
  "entity-detail": "DetailPanel",
  "detail-panel": "DetailPanel",
  "entity-list": "List",
  "master-detail": "MasterDetail",
  "search-bar": "SearchInput",
  "empty-state": "EmptyState",
  "loading-state": "LoadingState",
  breadcrumb: "Breadcrumb",
  stats: "StatCard",
  "form-section": "Form",
  form: "Form",
  "form-actions": "ButtonGroup",
  "filter-group": "ButtonGroup",
  "button-group": "ButtonGroup",
  // Layout patterns
  vstack: "VStackPattern",
  hstack: "HStackPattern",
  box: "BoxPattern",
  grid: "GridPattern",
  center: "CenterPattern",
  spacer: "SpacerPattern",
  divider: "DividerPattern",
  // Component patterns - Interactive
  button: "ButtonPattern",
  "icon-button": "IconButtonPattern",
  link: "LinkPattern",
  // Component patterns - Display
  text: "TextPattern",
  heading: "HeadingPattern",
  badge: "BadgePattern",
  avatar: "AvatarPattern",
  icon: "IconPattern",
  image: "ImagePattern",
  card: "CardPattern",
  "progress-bar": "ProgressBarPattern",
  spinner: "SpinnerPattern",
  // Component patterns - Form inputs
  input: "InputPattern",
  textarea: "TextareaPattern",
  select: "SelectPattern",
  checkbox: "CheckboxPattern",
  radio: "RadioPattern",
  label: "LabelPattern",
  // Component patterns - Feedback
  alert: "AlertPattern",
  tooltip: "TooltipPattern",
  popover: "PopoverPattern",
  // Component patterns - Navigation
  menu: "MenuPattern",
  accordion: "AccordionPattern",
  // Component patterns - Layout
  container: "ContainerPattern",
  "simple-grid": "SimpleGridPattern",
  "float-button": "FloatButtonPattern",
  // Custom pattern
  custom: "CustomPattern",
};

/**
 * Get the React component for a pattern type.
 * Uses shared resolver if available, falls back to local mapping.
 */
function getComponentForPattern(
  patternType: string
): React.ComponentType<any> | null {
  // Get component name from local mapping
  // TODO: When shared resolver is initialized at app startup, use:
  // const resolved = resolvePattern({ type: patternType });
  // const componentName = resolved.component;
  const componentName = PATTERN_TO_COMPONENT[patternType];

  if (!componentName) {
    return null;
  }

  return COMPONENT_REGISTRY[componentName] ?? null;
}

// Patterns that support nested children
const PATTERNS_WITH_CHILDREN = new Set([
  "vstack",
  "hstack",
  "box",
  "grid",
  "center",
  "card",
  "tooltip",
  "popover",
  "container",
  "simple-grid",
  "custom", // Custom patterns support nested children
]);

// ============================================================================
// Slot Component
// ============================================================================

interface UISlotComponentProps {
  slot: UISlot;
  portal?: boolean;
  position?:
    | "left"
    | "right"
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left";
  className?: string;
  draggable?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
  /** Compiled mode: render children directly instead of resolving from context */
  children?: React.ReactNode;
  /** Pattern type for data-pattern attribute (compiled mode) */
  pattern?: string;
  /** Source trait name for data-source-trait attribute (compiled mode) */
  sourceTrait?: string;
}

/**
 * Individual slot renderer.
 *
 * Handles different slot types with appropriate wrappers.
 */
function UISlotComponent({
  slot,
  portal = false,
  position,
  className,
  children,
  pattern,
  sourceTrait,
}: UISlotComponentProps): React.ReactElement | null {
  const { slots, clear } = useUISlots();
  const suspenseConfig = useContext(SuspenseConfigContext);
  const content = slots[slot];

  // Compiled mode: children provided directly, skip context resolution
  if (children !== undefined) {
    return (
      <Box
        id={`slot-${slot}`}
        className={cn("ui-slot", `ui-slot-${slot}`, className)}
        data-pattern={pattern}
        data-source-trait={sourceTrait}
      >
        {children}
      </Box>
    );
  }

  // Handle empty slot
  if (!content) {
    // For non-portal slots, render an empty placeholder
    if (!portal) {
      return (
        <Box
          id={`slot-${slot}`}
          className={cn("ui-slot", `ui-slot-${slot}`, className)}
        />
      );
    }
    return null;
  }

  // Render content based on slot type
  const handleDismiss = () => {
    clear(slot);
  };

  // Portal-based slots
  if (portal) {
    return (
      <SlotPortal
        slot={slot}
        content={content}
        position={position}
        onDismiss={handleDismiss}
      />
    );
  }

  // Inline slots — optionally wrapped in Suspense + ErrorBoundary
  const slotContent = (
    <SlotContentRenderer content={content} onDismiss={handleDismiss} />
  );

  const wrappedContent = suspenseConfig.enabled ? (
    <ErrorBoundary>
      <Suspense fallback={getSlotFallback(slot, suspenseConfig)}>
        {slotContent}
      </Suspense>
    </ErrorBoundary>
  ) : slotContent;

  return (
    <Box
      id={`slot-${slot}`}
      className={cn("ui-slot", `ui-slot-${slot}`, className)}
      data-pattern={content.pattern}
      data-source-trait={content.sourceTrait}
    >
      {wrappedContent}
    </Box>
  );
}

// ============================================================================
// Portal Renderer
// ============================================================================

interface SlotPortalProps {
  slot: UISlot;
  content: SlotContent;
  position?: string;
  onDismiss: () => void;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

function SlotPortal({
  slot,
  content,
  position,
  onDismiss,
}: SlotPortalProps): React.ReactElement | null {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Find or create portal root
    let root = document.getElementById("ui-slot-portal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "ui-slot-portal-root";
      document.body.appendChild(root);
    }
    setPortalRoot(root);
  }, []);

  if (!portalRoot) return null;

  // Render slot-specific wrapper
  let wrapper: React.ReactElement;

  switch (slot) {
    case "modal":
      wrapper = (
        <Modal
          isOpen={true}
          onClose={onDismiss}
          title={content.props.title as string | undefined}
          size={
            content.props.size as "sm" | "md" | "lg" | "xl" | "full" | undefined
          }
        >
          <SlotContentRenderer content={content} onDismiss={onDismiss} />
        </Modal>
      );
      break;

    case "drawer":
      wrapper = (
        <Drawer
          isOpen={true}
          onClose={onDismiss}
          title={content.props.title as string | undefined}
          position={(content.props.position as "left" | "right") ?? "right"}
          width={content.props.width as string | undefined}
        >
          <SlotContentRenderer content={content} onDismiss={onDismiss} />
        </Drawer>
      );
      break;

    case "toast":
      wrapper = (
        <Box className={cn("fixed z-50", getToastPosition(position))}>
          <Toast
            variant={
              (content.props.variant as
                | "success"
                | "error"
                | "warning"
                | "info") ?? "info"
            }
            title={content.props.title as string | undefined}
            message={(content.props.message as string) ?? ""}
            onDismiss={onDismiss}
          />
        </Box>
      );
      break;

    case "overlay":
      wrapper = (
        <Box
          className="fixed inset-0 z-50 bg-[var(--color-foreground)]/50 flex items-center justify-center"
          onClick={onDismiss}
        >
          <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <SlotContentRenderer content={content} onDismiss={onDismiss} />
          </Box>
        </Box>
      );
      break;

    case "center":
      wrapper = (
        <Box className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <Box className="pointer-events-auto">
            <SlotContentRenderer content={content} onDismiss={onDismiss} />
          </Box>
        </Box>
      );
      break;

    default:
      wrapper = <SlotContentRenderer content={content} onDismiss={onDismiss} />;
  }

  return createPortal(wrapper, portalRoot);
}

function getToastPosition(position?: string): string {
  switch (position) {
    case "top-left":
      return "top-4 left-4";
    case "top-right":
      return "top-4 right-4";
    case "bottom-left":
      return "bottom-4 left-4";
    case "bottom-right":
      return "bottom-4 right-4";
    default:
      return "top-4 right-4";
  }
}

// ============================================================================
// Content Renderer
// ============================================================================

interface SlotContentRendererProps {
  content: SlotContent;
  onDismiss: () => void;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

/**
 * Recursively render nested pattern children.
 *
 * Takes an array of child pattern configurations and renders them recursively.
 */
function renderPatternChildren(
  children:
    | Array<{ type: string; props?: Record<string, unknown> }>
    | undefined,
  onDismiss: () => void,
): React.ReactNode {
  if (!children || !Array.isArray(children) || children.length === 0) {
    return null;
  }

  return children.map((child, index) => {
    if (!child || typeof child !== "object") return null;

    const childContent: SlotContent = {
      id: `child-${index}`,
      pattern: child.type,
      props: child.props ?? {},
      priority: 0,
    };

    return (
      <SlotContentRenderer
        key={`child-${index}-${child.type}`}
        content={childContent}
        onDismiss={onDismiss}
      />
    );
  });
}

/**
 * Renders the actual content of a slot.
 *
 * Dynamically renders pattern components from the registry.
 * For layout patterns with `hasChildren`, recursively renders nested patterns.
 */
function SlotContentRenderer({
  content,
  onDismiss,
}: SlotContentRendererProps): React.ReactElement {
  const PatternComponent = getComponentForPattern(content.pattern);

  // If we have a registered component, render it with props
  if (PatternComponent) {
    // Check if this pattern supports children and has children defined
    const supportsChildren = PATTERNS_WITH_CHILDREN.has(content.pattern);
    const childrenConfig = content.props.children as
      | Array<{ type: string; props?: Record<string, unknown> }>
      | undefined;

    // Render children recursively for layout patterns
    const renderedChildren = supportsChildren
      ? renderPatternChildren(childrenConfig, onDismiss)
      : undefined;

    // Extract props without the children config (we pass rendered children instead)
    const { children: _childrenConfig, ...restProps } = content.props;

    return (
      <Box
        className="slot-content"
        data-pattern={content.pattern}
        data-id={content.id}
      >
        <PatternComponent {...restProps} onDismiss={onDismiss}>
          {renderedChildren}
        </PatternComponent>
      </Box>
    );
  }

  // Fallback for unknown patterns - show placeholder
  return (
    <Box
      className="slot-content"
      data-pattern={content.pattern}
      data-id={content.id}
    >
      {(content.props.children as React.ReactNode) ?? (
        <Box className="p-4 text-sm text-[var(--color-muted-foreground)] border border-dashed border-[var(--color-border)] rounded">
          Unknown pattern: {content.pattern}
          {content.sourceTrait && (
            <Typography variant="small" className="ml-2">(from {content.sourceTrait})</Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export interface UISlotRendererProps {
  /** Include HUD slots */
  includeHud?: boolean;
  /** Include floating slot */
  includeFloating?: boolean;
  /** Additional class name for the container */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /**
   * Enable Suspense boundaries around each slot.
   * When true, each inline slot is wrapped in `<ErrorBoundary><Suspense>` with
   * Skeleton fallbacks. Opt-in — existing isLoading prop pattern still works.
   */
  suspense?: boolean | SuspenseConfig;
}

/**
 * Main UI Slot Renderer component.
 *
 * Renders all slot containers. Place this in your page/layout component.
 *
 * @example
 * ```tsx
 * function PageLayout() {
 *   return (
 *     <div className="page-layout">
 *       <UISlotRenderer />
 *     </div>
 *   );
 * }
 * ```
 */
export function UISlotRenderer({
  includeHud = false,
  includeFloating = false,
  className,
  suspense,
}: UISlotRendererProps): React.ReactElement {
  const suspenseConfig: SuspenseConfig =
    suspense === true ? { enabled: true } :
    suspense && typeof suspense === 'object' ? suspense :
    { enabled: false };

  const content = (
    <Box className={cn("ui-slot-renderer", className)}>
      {/* Layout slots */}
      <UISlotComponent slot="sidebar" className="ui-slot-sidebar" />
      <UISlotComponent slot="main" className="ui-slot-main flex-1" />

      {/* Portal slots */}
      <UISlotComponent slot="modal" portal />
      <UISlotComponent slot="drawer" portal />
      <UISlotComponent slot="overlay" portal />
      <UISlotComponent slot="center" portal />
      <UISlotComponent slot="toast" portal position="top-right" />

      {/* HUD slots (optional, for games) */}
      {includeHud && (
        <>
          <UISlotComponent
            slot="hud-top"
            className="fixed top-0 inset-x-0 z-40"
          />
          <UISlotComponent
            slot="hud-bottom"
            className="fixed bottom-0 inset-x-0 z-40"
          />
        </>
      )}

      {/* Floating slot (optional) */}
      {includeFloating && (
        <UISlotComponent slot="floating" className="fixed z-50" draggable />
      )}
    </Box>
  );

  // Wrap with SuspenseConfigProvider when Suspense is enabled
  if (suspenseConfig.enabled) {
    return (
      <SuspenseConfigProvider config={suspenseConfig}>
        {content}
      </SuspenseConfigProvider>
    );
  }

  return content;
}

UISlotRenderer.displayName = "UISlotRenderer";

// ============================================================================
// Exports
// ============================================================================

export { UISlotComponent, SlotContentRenderer };
