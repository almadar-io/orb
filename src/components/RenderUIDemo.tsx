import React, { useState, useEffect, useCallback, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import type { SExpr } from '@almadar/core';

// Design system infrastructure — already synced into the website
import { EventBusProvider } from '../../../../src/design-systems/almadar-ui/providers/OrbitalProvider';
import {
  UISlotProvider,
  useUISlots,
  type UISlot,
} from '../../../../src/design-systems/almadar-ui/context/UISlotContext';
import { UISlotComponent } from '../../../../src/design-systems/almadar-ui/components/organisms/UISlotRenderer';

// Theme CSS — provides data-theme CSS variable definitions
import '../../../../src/design-systems/almadar-ui/themes/index.css';

import { RENDER_UI_EXAMPLES, type RenderUIExample } from '../data/render-ui-registry';
import styles from './RenderUIDemo.module.css';

// ─── Monaco editor (lazy, browser-only) ───────────────────────────────────────

function DemoEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [MonacoEditor, setMonacoEditor] = useState<React.ComponentType<{
    value: string;
    onChange: (v: string | undefined) => void;
    language: string;
    theme: string;
    height: string;
    options: Record<string, unknown>;
  }> | null>(null);

  useEffect(() => {
    import('@monaco-editor/react').then((mod) => {
      setMonacoEditor(() => mod.default);
    });
  }, []);

  if (!MonacoEditor) {
    return (
      <textarea
        className={styles.fallbackTextarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    );
  }

  return (
    <MonacoEditor
      value={value}
      onChange={(v) => onChange(v ?? '')}
      language="json"
      theme="vs-dark"
      height="100%"
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        tabSize: 2,
        automaticLayout: true,
      }}
    />
  );
}

// ─── Demo core (must be inside UISlotProvider) ────────────────────────────────

interface DemoCoreProps {
  code: string;
  setCode: (v: string) => void;
  activeId: string;
  onSelectExample: (ex: RenderUIExample) => void;
  isRunning: boolean;
  error: string | null;
  onRun: () => void;
}

function DemoCore({ code, setCode, activeId, onSelectExample, isRunning, error, onRun }: DemoCoreProps) {
  return (
    <div>
      <div className={styles.examples}>
        {RENDER_UI_EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            className={`${styles.exampleBtn} ${ex.id === activeId ? styles.exampleBtnActive : ''}`}
            onClick={() => onSelectExample(ex)}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className={styles.splitPanel}>
        {/* Editor */}
        <div className={styles.editorPanel}>
          <div className={styles.panelLabel}>
            <span>S-Expression</span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem' }}>JSON</span>
          </div>
          <div className={styles.editorArea}>
            <DemoEditor value={code} onChange={setCode} />
          </div>
          <div className={styles.runBar}>
            <button className={styles.runBtn} onClick={onRun} disabled={isRunning}>
              {isRunning ? '...' : 'Run'}
            </button>
            <span className={styles.runHint}>Ctrl+Enter</span>
          </div>
        </div>

        {/* Preview */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <span className={`${styles.statusDot} ${error ? styles.statusDotError : ''}`} />
            <span>Preview</span>
          </div>
          {error ? (
            <div className={styles.previewError}>
              <pre className={styles.errorText}>{error}</pre>
            </div>
          ) : (
            <div
              className={styles.previewBody}
              data-theme="minimalist-light"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)',
                colorScheme: 'light',
              }}
            >
              <UISlotComponent slot="main" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Outer controller — holds state, wires evaluator to slot manager ──────────

function RenderUIDemoController() {
  const defaultExample = RENDER_UI_EXAMPLES[0];
  const [code, setCode] = useState(defaultExample.code);
  const [activeId, setActiveId] = useState(defaultExample.id);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slotManager = useUISlots();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(async (src: string) => {
    setIsRunning(true);
    setError(null);
    slotManager.clearAll();
    try {
      const parsed = JSON.parse(src.trim()) as unknown;
      const { SExpressionEvaluator, createMinimalContext, createEffectContext } = await import('@almadar/evaluator');
      const evaluator = new SExpressionEvaluator();
      const ctx = createMinimalContext({}, {}, 'initial');
      const effectCtx = createEffectContext(ctx, {
        renderUI: (slot: string, pattern: unknown, props?: Record<string, unknown>) => {
          slotManager.render({
            target: slot as UISlot,
            pattern: String(pattern),
            props: props ?? {},
          });
        },
      });
      evaluator.evaluate(parsed as SExpr, effectCtx);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  }, [slotManager]);

  // Auto-run on code change (debounced 600ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { run(code); }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [code, run]);

  // Ctrl/Cmd+Enter shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        run(code);
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [code, run]);

  function selectExample(ex: RenderUIExample) {
    setActiveId(ex.id);
    setCode(ex.code);
  }

  return (
    <DemoCore
      code={code}
      setCode={setCode}
      activeId={activeId}
      onSelectExample={selectExample}
      isRunning={isRunning}
      error={error}
      onRun={() => run(code)}
    />
  );
}

// ─── Browser-only wrapper with providers ──────────────────────────────────────

function RenderUIDemoBrowser() {
  return (
    <EventBusProvider>
      <UISlotProvider>
        <RenderUIDemoController />
      </UISlotProvider>
    </EventBusProvider>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function RenderUIDemo(): React.JSX.Element {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>
            <Translate id="developers.renderUIDemo.tag">render-ui</Translate>
          </span>
          <Heading as="h2" className={styles.sectionTitle}>
            <Translate id="developers.renderUIDemo.title">Live Component Preview</Translate>
          </Heading>
          <p className={styles.sectionSubtitle}>
            <Translate id="developers.renderUIDemo.subtitle">
              render-ui turns an s-expression into a real component — no JSX, no template files.
              Edit the expression and watch the preview update automatically.
            </Translate>
          </p>
        </div>

        <BrowserOnly fallback={<div style={{ height: 420, background: '#1e1e2e', borderRadius: 8 }} />}>
          {() => <RenderUIDemoBrowser />}
        </BrowserOnly>
      </div>
    </section>
  );
}
