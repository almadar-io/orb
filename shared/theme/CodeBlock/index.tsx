import React, { useState, useCallback, isValidElement } from 'react';

/**
 * CodeBlock Swizzle
 *
 * Wraps Docusaurus code blocks with @almadar/ui themed styling.
 * Uses our design tokens for colors, borders, and radii.
 * Falls back gracefully if children aren't a standard Prism code block.
 */

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  metastring?: string;
  title?: string;
  language?: string;
  showLineNumbers?: boolean;
}

function extractCode(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (isValidElement(children) && typeof children.props.children === 'string') {
    return children.props.children;
  }
  return '';
}

export default function CodeBlock({
  children,
  title,
  language,
  className,
  showLineNumbers,
  ...props
}: CodeBlockProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const code = extractCode(children);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [code]);

  const lang = language || (className?.replace(/language-/, '') ?? '');

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md, 10px)',
        border: '1px solid var(--color-border, rgba(20, 184, 166, 0.15))',
        overflow: 'hidden',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        position: 'relative',
      }}
    >
      {title && (
        <div
          style={{
            background: 'var(--color-muted, #f1f5f9)',
            borderBottom: '1px solid var(--color-border, rgba(20, 184, 166, 0.15))',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-family-mono, monospace)',
              fontSize: '0.8rem',
              color: 'var(--color-muted-foreground, #64748b)',
              fontWeight: 500,
            }}
          >
            {title}
          </span>
          {lang && (
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--color-primary, #14b8a6)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}
            >
              {lang}
            </span>
          )}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <pre
          style={{
            margin: 0,
            padding: '1rem',
            background: 'var(--color-foreground, #0f172a)',
            color: 'var(--color-background, #f8fafc)',
            fontFamily: 'var(--font-family-mono, "IBM Plex Mono", monospace)',
            fontSize: '0.85rem',
            lineHeight: 1.7,
            overflowX: 'auto',
          }}
          className={className}
        >
          {children}
        </pre>

        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-sm, 6px)',
            color: 'rgba(255, 255, 255, 0.6)',
            padding: '0.25rem 0.5rem',
            fontSize: '0.7rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
