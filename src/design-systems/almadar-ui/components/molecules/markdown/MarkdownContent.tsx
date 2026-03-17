/**
 * MarkdownContent Molecule Component
 *
 * Renders markdown content with support for GFM (GitHub Flavored Markdown)
 * and math equations (KaTeX). Handles inline code only — fenced code blocks
 * should be parsed out and rendered with CodeBlock component.
 *
 * Event Contract:
 * - No events emitted (display-only component)
 * - entityAware: false
 *
 * NOTE: This component uses dynamic import for react-markdown to avoid SSR issues
 * with decode-named-character-reference which accesses document at module level.
 */

import React, { useEffect, useState } from 'react';
import { Box } from '../../atoms/Box';
import { useTranslate } from '../../../hooks/useTranslate';
import { cn } from '../../../lib/cn';

export interface MarkdownContentProps {
  /** The markdown content to render */
  content: string;
  /** Text direction */
  direction?: 'rtl' | 'ltr';
  /** Additional CSS classes */
  className?: string;
}

// Dynamically imported modules (client-only)
type ReactMarkdownType = typeof import('react-markdown').default;
type RemarkPlugin = import('react-markdown').Options['remarkPlugins'];
type RehypePlugin = import('react-markdown').Options['rehypePlugins'];
type Components = import('react-markdown').Options['components'];

export const MarkdownContent = React.memo<MarkdownContentProps>(
  ({ content, direction, className }) => {
    const { t: _t } = useTranslate();
    const [ReactMarkdown, setReactMarkdown] = useState<ReactMarkdownType | null>(null);
    const [plugins, setPlugins] = useState<{
      remarkPlugins: RemarkPlugin;
      rehypePlugins: RehypePlugin;
    } | null>(null);

    // Dynamically import react-markdown and plugins (client-only)
    useEffect(() => {
      Promise.all([
        import('react-markdown'),
        import('remark-gfm'),
        import('remark-math'),
        import('rehype-katex'),
      ]).then(([reactMarkdownMod, remarkGfmMod, remarkMathMod, rehypeKatexMod]) => {
        // Import KaTeX CSS on client only
        import('katex/dist/katex.min.css');
        
        setReactMarkdown(() => reactMarkdownMod.default);
        setPlugins({
          remarkPlugins: [remarkMathMod.default, remarkGfmMod.default],
          rehypePlugins: [[rehypeKatexMod.default, { strict: false, throwOnError: false }]],
        });
      });
    }, []);

    // Define components config
    const components: Components = React.useMemo(() => ({
      // Handle inline code only — fenced code blocks are parsed out separately
      code({ className: codeClassName, children, ...props }) {
        return (
          <code
            {...props}
            className={codeClassName}
            style={{
              backgroundColor: '#1f2937',
              color: '#e5e7eb',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {children}
          </code>
        );
      },
      // Style links
      a({ href, children, ...props }) {
        return (
          <a
            href={href}
            {...props}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        );
      },
      // Style tables
      table({ children, ...props }) {
        return (
          <div className="overflow-x-auto my-4">
            <table
              {...props}
              className="min-w-full border-collapse border border-gray-300 dark:border-gray-600"
            >
              {children}
            </table>
          </div>
        );
      },
      th({ children, ...props }) {
        return (
          <th
            {...props}
            className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold"
          >
            {children}
          </th>
        );
      },
      td({ children, ...props }) {
        return (
          <td
            {...props}
            className="border border-gray-300 dark:border-gray-600 px-4 py-2"
          >
            {children}
          </td>
        );
      },
      // Style blockquotes
      blockquote({ children, ...props }) {
        return (
          <blockquote
            {...props}
            className="border-l-4 border-blue-500 pl-4 italic text-[var(--color-foreground)] my-4"
          >
            {children}
          </blockquote>
        );
      },
    }), []);

    // Show placeholder while loading
    if (!ReactMarkdown || !plugins) {
      return (
        <Box
          className={cn('prose prose-slate dark:prose-invert max-w-none', className)}
          style={{ direction }}
        >
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </Box>
      );
    }

    return (
      <Box
        className={cn('prose prose-slate dark:prose-invert max-w-none', className)}
        style={{ direction }}
      >
        <ReactMarkdown
          remarkPlugins={plugins.remarkPlugins}
          rehypePlugins={plugins.rehypePlugins}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </Box>
    );
  },
  (prev, next) =>
    prev.content === next.content &&
    prev.className === next.className &&
    prev.direction === next.direction,
);

MarkdownContent.displayName = 'MarkdownContent';
