'use client';
/**
 * CustomPattern Component
 *
 * Renders freeform elements with Tailwind classes for custom UI designs.
 * Uses Box with the `as` prop to render different element types.
 * Supports nested children and the closed circuit pattern (action prop for events).
 *
 * @packageDocumentation
 */

import React from "react";
import { useEventBus } from "../../hooks/useEventBus";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

// ============================================================================
// Types
// ============================================================================

/**
 * Allowed element types for custom patterns.
 */
// eslint-disable-next-line almadar/require-display-name -- constant array, not a component
export const ALLOWED_CUSTOM_COMPONENTS = [
  "div",
  "span",
  "button",
  "a",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "footer",
  "section",
  "article",
  "nav",
  "main",
  "aside",
  "ul",
  "ol",
  "li",
  "img",
  "label",
  "input",
  "form",
] as const;

export type AllowedCustomComponent = (typeof ALLOWED_CUSTOM_COMPONENTS)[number];

/**
 * Check if a component name is allowed.
 */
export function isAllowedComponent(
  component: string,
): component is AllowedCustomComponent {
  return ALLOWED_CUSTOM_COMPONENTS.includes(
    component as AllowedCustomComponent,
  );
}

/**
 * Interactive elements that require action prop for closed circuit.
 */
const INTERACTIVE_ELEMENTS = new Set<string>(["button", "a"]);

/**
 * Check if an element is interactive (requires action for closed circuit).
 */
export function isInteractiveElement(component: string): boolean {
  return INTERACTIVE_ELEMENTS.has(component);
}

/**
 * Heading level mapping for Typography variant.
 */
const HEADING_VARIANT_MAP: Record<string, "h1" | "h2" | "h3" | "h4" | "h5" | "h6"> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
};

// ============================================================================
// Props
// ============================================================================

export interface CustomPatternProps {
  /** Element type to render */
  component: AllowedCustomComponent;
  /** Tailwind classes */
  className?: string;
  /** Token path(s) for design token resolution */
  token?: string | string[];
  /** Text content (for leaf elements) */
  content?: string;
  /** Event to emit on click (REQUIRED for interactive elements) */
  action?: string;
  /** Event payload */
  payload?: Record<string, unknown>;
  /** Nested children patterns */
  children?: React.ReactNode;
  /** Image source (for img elements) */
  src?: string;
  /** Image alt text (for img elements) */
  alt?: string;
  /** Link href (for a elements) */
  href?: string;
  /** Open link in new tab */
  external?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional HTML attributes */
  htmlProps?: Record<string, unknown>;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name */
  entity?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Renders a custom element with Tailwind styling.
 *
 * Follows the closed circuit pattern - interactive elements emit events via action prop.
 * Uses Box with `as` prop for all element types to comply with the design system.
 *
 * @example
 * ```tsx
 * <CustomPattern
 *   component="button"
 *   className="bg-blue-500 text-white px-4 py-2 rounded"
 *   action="SUBMIT"
 *   content="Submit"
 * />
 * ```
 */
export function CustomPattern({
  component,
  className,
  content,
  action,
  payload,
  children,
  src,
  alt,
  href,
  external,
  disabled,
  htmlProps,
}: CustomPatternProps): React.ReactElement | null {
  const { emit } = useEventBus();
  const classes = cn(className);

  // Validate component
  if (!isAllowedComponent(component)) {
    console.warn(
      `CustomPattern: Unknown component "${component}", falling back to Box`,
    );
    return (
      <Box
        className={cn(
          classes,
          "p-4 border border-dashed border-[var(--color-error)]/50 text-[var(--color-error)]",
        )}
      >
        Unknown component: {component}
      </Box>
    );
  }

  // Handle click for interactive elements
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;

    // For links without action, let browser handle navigation
    if (component === "a" && href && !action) {
      return;
    }

    // Emit event if action is defined
    if (action) {
      e.preventDefault();
      emit(`UI:${action}`, payload ?? {});
    }
  };

  // Determine content to render
  const renderContent = children ?? content;

  // Build common props
  const commonProps: Record<string, unknown> = {
    className: classes || undefined,
    ...htmlProps,
  };

  // Add click handler for interactive elements or elements with action
  if (action || isInteractiveElement(component)) {
    commonProps.onClick = handleClick;
  }

  // Handle disabled state
  if (disabled) {
    commonProps["aria-disabled"] = true;
    if (component === "button") {
      commonProps.disabled = true;
    }
  }

  // Render based on component type using design system components
  switch (component) {
    case "button":
      return (
        <Button
          variant="secondary"
          className={classes}
          disabled={disabled}
          onClick={handleClick}
          {...(htmlProps as Record<string, unknown>)}
        >
          {renderContent}
        </Button>
      );

    case "a":
      return (
        // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic anchor with href
        <a
          href={href ?? "#"}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          {...commonProps}
        >
          {renderContent}
        </a>
      );

    case "img":
      return (
        // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic img with src/alt
        <img
          src={src}
          alt={alt ?? ""}
          {...commonProps}
        />
      );

    case "input":
      return (
        <Input
          className={classes}
          disabled={disabled}
          {...(htmlProps as Record<string, unknown>)}
        />
      );

    case "label":
      return (
        <Typography
          as="label"
          className={classes}
          {...(htmlProps as Record<string, unknown>)}
        >
          {renderContent}
        </Typography>
      );

    case "form":
      return (
        <Box
          as="form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            if (action) {
              emit(`UI:${action}`, payload ?? {});
            }
          }}
          {...commonProps}
        >
          {renderContent}
        </Box>
      );

    // Heading elements — use Typography with appropriate variant
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return (
        <Typography
          variant={HEADING_VARIANT_MAP[component]}
          className={classes}
          {...(htmlProps as Record<string, unknown>)}
        >
          {renderContent}
        </Typography>
      );

    // List elements — use Box with semantic `as`
    case "ul":
      return (
        <Box as="ul" {...commonProps}>
          {renderContent}
        </Box>
      );
    case "ol":
      return (
        <Box as="ol" {...commonProps}>
          {renderContent}
        </Box>
      );
    case "li":
      return (
        <Box as="li" {...commonProps}>
          {renderContent}
        </Box>
      );

    // Semantic elements — use Box with semantic `as`
    case "header":
      return (
        <Box as="header" {...commonProps}>
          {renderContent}
        </Box>
      );
    case "footer":
      return (
        <Box as="footer" {...commonProps}>
          {renderContent}
        </Box>
      );
    case "section":
      return (
        <Box as="section" {...commonProps}>
          {renderContent}
        </Box>
      );
    case "article":
      return (
        <Box as="article" {...commonProps}>
          {renderContent}
        </Box>
      );
    case "nav":
      return (
        <Box as="nav" {...commonProps}>
          {renderContent}
        </Box>
      );
    case "main":
      return (
        <Box as="main" {...commonProps}>
          {renderContent}
        </Box>
      );
    case "aside":
      return (
        <Box as="aside" {...commonProps}>
          {renderContent}
        </Box>
      );

    // Text elements
    case "span":
      return (
        <Typography variant="body" as="span" className={classes} {...(htmlProps as Record<string, unknown>)}>
          {renderContent}
        </Typography>
      );
    case "p":
      return (
        <Typography variant="body" className={classes} {...(htmlProps as Record<string, unknown>)}>
          {renderContent}
        </Typography>
      );

    // Default — use Box
    case "div":
    default:
      return (
        <Box {...commonProps}>
          {renderContent}
        </Box>
      );
  }
}

CustomPattern.displayName = "CustomPattern";

// ============================================================================
// Recursive Custom Pattern Renderer
// ============================================================================

export interface CustomPatternConfig {
  type: "custom";
  component: AllowedCustomComponent;
  className?: string;
  token?: string | string[];
  content?: string;
  action?: string;
  payload?: Record<string, unknown>;
  children?: CustomPatternConfig[];
  src?: string;
  alt?: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  [key: string]: unknown;
}

/**
 * Check if a pattern config is a custom pattern.
 */
export function isCustomPatternConfig(
  config: unknown,
): config is CustomPatternConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    (config as Record<string, unknown>).type === "custom"
  );
}

/**
 * Recursively render custom pattern configurations.
 *
 * Use this to render nested custom patterns from render_ui effects.
 */
export function renderCustomPattern(
  config: CustomPatternConfig,
  key?: string | number,
): React.ReactElement {
  const {
    component,
    className,
    token,
    content,
    action,
    payload,
    children,
    src,
    alt,
    href,
    external,
    disabled,
    ...rest
  } = config;

  // Recursively render children
  const renderedChildren = children?.map((child, index) =>
    renderCustomPattern(child, index),
  );

  return (
    <CustomPattern
      key={key}
      component={component}
      className={className}
      token={token}
      content={content}
      action={action}
      payload={payload}
      src={src}
      alt={alt}
      href={href}
      external={external}
      disabled={disabled}
      htmlProps={rest}
    >
      {renderedChildren}
    </CustomPattern>
  );
}

// ============================================================================
// Exports
// ============================================================================

export { ALLOWED_CUSTOM_COMPONENTS as CUSTOM_COMPONENT_TYPES };
