import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * SearchBar Swizzle
 *
 * Themed search bar using @almadar/ui design tokens.
 * Integrates with Docusaurus's search system (local or algolia).
 * Styled with CSS variables for per-site theming.
 */

export default function SearchBar(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setFocused(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: focused
            ? 'var(--color-card, #ffffff)'
            : 'var(--color-muted, #f1f5f9)',
          border: `1px solid ${focused ? 'var(--color-primary, #14b8a6)' : 'var(--color-border, rgba(20, 184, 166, 0.15))'}`,
          borderRadius: 'var(--radius-md, 10px)',
          padding: '0.4rem 0.75rem',
          transition: 'all 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(20, 184, 166, 0.1)' : 'none',
          minWidth: focused ? '280px' : '200px',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: 'var(--color-muted-foreground, #64748b)',
            flexShrink: 0,
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          placeholder="Search docs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--color-foreground, #0f172a)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-family, inherit)',
            width: '100%',
            padding: 0,
          }}
        />

        {!focused && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--color-muted-foreground, #64748b)',
              border: '1px solid var(--color-border, rgba(20, 184, 166, 0.15))',
              borderRadius: '4px',
              padding: '0.1rem 0.35rem',
              fontFamily: 'var(--font-family-mono, monospace)',
              whiteSpace: 'nowrap',
            }}
          >
            Ctrl K
          </span>
        )}
      </div>
    </div>
  );
}
