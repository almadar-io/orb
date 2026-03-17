/**
 * Base template types for Almadar UI.
 *
 * All templates MUST extend `TemplateProps<E>` to enforce entity-only data flow
 * and JSON round-trip compatibility with the flattener pipeline.
 *
 * @see docs/Almadar_Templates.md
 */

/** Base props for all templates — enforces entity-only data flow. */
export interface TemplateProps<E extends { id: string }> {
    /** Entity data — the sole source of runtime state */
    entity: E;
    /** External styling override */
    className?: string;
}
