/**
 * CodeBlock Molecule Component
 *
 * A syntax-highlighted code block with copy-to-clipboard functionality.
 * Preserves scroll position during re-renders.
 *
 * Event Contract:
 * - Emits: UI:COPY_CODE { language, success }
 *
 * NOTE: Uses dynamic import for react-syntax-highlighter to avoid SSR issues
 * with decode-named-character-reference which accesses document at module level.
 */

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Box } from '../../atoms/Box';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { HStack } from '../../atoms/Stack';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';

export interface CodeBlockProps {
  /** The code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Show the copy button */
  showCopyButton?: boolean;
  /** Show the language badge */
  showLanguageBadge?: boolean;
  /** Maximum height before scrolling */
  maxHeight?: string;
  /** Additional CSS classes */
  className?: string;
}

// Dynamically imported types
type SyntaxHighlighterType = typeof import('react-syntax-highlighter').Prism;
type StyleType = Record<string, React.CSSProperties>;

export const CodeBlock = React.memo<CodeBlockProps>(
  ({
    code,
    language = 'text',
    showCopyButton = true,
    showLanguageBadge = true,
    maxHeight = '60vh',
    className,
  }) => {
    const eventBus = useEventBus();
    const { t: _t } = useTranslate();
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const savedScrollLeftRef = useRef<number>(0);
    const [copied, setCopied] = useState(false);
    const [SyntaxHighlighter, setSyntaxHighlighter] = useState<SyntaxHighlighterType | null>(null);
    const [style, setStyle] = useState<StyleType | null>(null);

    // Dynamically import react-syntax-highlighter (client-only)
    useEffect(() => {
      Promise.all([
        import('react-syntax-highlighter'),
        import('react-syntax-highlighter/dist/cjs/styles/prism'),
      ]).then(([syntaxHighlighterMod, stylesMod]) => {
        setSyntaxHighlighter(() => syntaxHighlighterMod.Prism);
        setStyle(stylesMod.vscDarkPlus);
      });
    }, []);

    // Save scrollLeft before updates
    useLayoutEffect(() => {
      const el = scrollRef.current;
      return () => {
        if (el) savedScrollLeftRef.current = el.scrollLeft;
      };
    }, [language, code]);

    // Restore scrollLeft after updates
    useLayoutEffect(() => {
      const el = scrollRef.current;
      if (el) el.scrollLeft = savedScrollLeftRef.current;
    }, [language, code]);

    // Native scroll listener to keep position updated
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const handle = () => {
        savedScrollLeftRef.current = el.scrollLeft;
      };
      el.addEventListener('scroll', handle, { passive: true });
      return () => el.removeEventListener('scroll', handle);
    }, [language, code]);

    // Copy to clipboard handler
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        eventBus.emit('UI:COPY_CODE', { language, success: true });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        eventBus.emit('UI:COPY_CODE', { language, success: false });
      }
    };

    // Show placeholder while loading
    if (!SyntaxHighlighter || !style) {
      return (
        <Box className={`relative group ${className || ''}`}>
          {(showLanguageBadge || showCopyButton) && (
            <HStack
              justify="between"
              align="center"
              className="px-3 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700"
            >
              {showLanguageBadge && (
                <Badge variant="default" size="sm">
                  {language}
                </Badge>
              )}
            </HStack>
          )}
          <div
            className="animate-pulse"
            style={{
              backgroundColor: '#1e1e1e',
              borderRadius: showLanguageBadge || showCopyButton ? '0 0 0.5rem 0.5rem' : '0.5rem',
              padding: '1rem',
              maxHeight,
            }}
          >
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </Box>
      );
    }

    return (
      <Box className={`relative group ${className || ''}`}>
        {/* Header with language badge and copy button */}
        {(showLanguageBadge || showCopyButton) && (
          <HStack
            justify="between"
            align="center"
            className="px-3 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700"
          >
            {showLanguageBadge && (
              <Badge variant="default" size="sm">
                {language}
              </Badge>
            )}
            {showCopyButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-[var(--color-muted-foreground)] hover:text-white"
                aria-label="Copy code"
              >
                {copied ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            )}
          </HStack>
        )}

        {/* Code content — native div required for scroll ref management */}
        <div
          ref={scrollRef}
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            maxHeight,
            overscrollBehavior: 'auto',
            touchAction: 'pan-x pan-y',
            contain: 'paint',
            backgroundColor: '#1e1e1e',
            borderRadius:
              showLanguageBadge || showCopyButton
                ? '0 0 0.5rem 0.5rem'
                : '0.5rem',
            padding: '1rem',
          }}
        >
          <SyntaxHighlighter
            PreTag="div"
            language={language}
            style={style}
            customStyle={{
              backgroundColor: 'transparent',
              borderRadius: 0,
              padding: 0,
              margin: 0,
              whiteSpace: 'pre',
              minWidth: '100%',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </Box>
    );
  },
  (prev, next) =>
    prev.language === next.language &&
    prev.code === next.code &&
    prev.showCopyButton === next.showCopyButton &&
    prev.maxHeight === next.maxHeight,
);

CodeBlock.displayName = 'CodeBlock';
