/**
 * CodeBlock swizzle — re-export the default Docusaurus CodeBlock unchanged.
 *
 * Wrapping it in a function component breaks docusaurus's internal ref
 * forwarding to the underlying <pre>. `useCodeWordWrap` then destructures
 * `scrollWidth` from a null ref when its ResizeObserver fires, throwing
 * `Cannot destructure property 'scrollWidth' of 'codeBlockRef.current'
 * as it is null` on every page that renders a code fence.
 */
export { default } from '@theme-original/CodeBlock';
