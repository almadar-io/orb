/**
 * AlmadarBuilder
 *
 * Self-contained builder component for the Almadar website.
 * Talks to the agent server via SSE for schema generation, validation, and editing.
 *
 * Used in:
 * - orb.almadar.io: "Try it" section in the hero
 * - studio.almadar.io: Interactive demo on the landing page
 *
 * No @almadar/ui dependency. Uses plain HTML + CSS modules (Docusaurus context).
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  generateSchema,
  validateSchema,
  editSchema,
  type BuilderMode,
  type BuilderPhase,
  type BuilderSSEEvent,
  type BuilderStreamResponse,
} from './builderApi';
import { Zap, AlertTriangle } from 'lucide-react';
import styles from './AlmadarBuilder.module.css';

// ============================================================================
// Types
// ============================================================================

export interface AlmadarBuilderProps {
  className?: string;
  compact?: boolean;
  onSchemaGenerated?: (schema: string) => void;
  studioUrl?: string;
}

interface StreamRef {
  cancel: () => void;
  promise: Promise<BuilderStreamResponse>;
}

// ============================================================================
// Component
// ============================================================================

export function AlmadarBuilder({
  className,
  compact = false,
  onSchemaGenerated,
  studioUrl = 'https://studio.almadar.io/app',
}: AlmadarBuilderProps): React.ReactElement {
  // State
  const [status, setStatus] = useState<'idle' | 'generating' | 'validating' | 'editing' | 'complete' | 'error'>('idle');
  const [phase, setPhase] = useState<BuilderPhase | null>(null);
  const [phaseDetail, setPhaseDetail] = useState<string | null>(null);
  const [schema, setSchema] = useState<string | null>(null);
  const [validation, setValidation] = useState<{ pass: boolean; errors: string[]; warnings: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [mode, setMode] = useState<BuilderMode>('auto');
  const [input, setInput] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInput, setEditInput] = useState('');
  const [copied, setCopied] = useState(false);

  const streamRef = useRef<StreamRef | null>(null);

  const isProcessing = status === 'generating' || status === 'editing' || status === 'validating';
  const showResults = schema !== null;

  // SSE event handler
  const handleEvent = useCallback((event: BuilderSSEEvent) => {
    switch (event.type) {
      case 'status':
        setPhase((event.data.phase as BuilderPhase) || null);
        setPhaseDetail((event.data.detail as string) || null);
        break;
      case 'message':
        setMessages(prev => [...prev, (event.data.content as string) || '']);
        break;
      case 'schema':
        setSchema((event.data.orb as string) || null);
        break;
      case 'validation':
        setValidation({
          pass: (event.data.pass as boolean) ?? false,
          errors: (event.data.errors as string[]) || [],
          warnings: (event.data.warnings as string[]) || [],
        });
        break;
      case 'done': {
        const ok = (event.data.success as boolean) ?? false;
        if (event.data.schema) setSchema(event.data.schema as string);
        setStatus(ok ? 'complete' : 'error');
        if (!ok && event.data.error) setError(event.data.error as string);
        if (ok && event.data.schema) onSchemaGenerated?.(event.data.schema as string);
        break;
      }
      case 'error':
        setError((event.data.error as string) || 'Unknown error');
        setStatus('error');
        break;
    }
  }, [onSchemaGenerated]);

  // Generate
  const handleGenerate = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt) return;

    setStatus('generating');
    setPhase('parsing');
    setPhaseDetail(null);
    setError(null);
    setSchema(null);
    setValidation(null);
    setMessages([]);
    setIsEditMode(false);
    setInput('');

    const stream = generateSchema(prompt, mode, handleEvent);
    streamRef.current = stream;
    const result = await stream.promise;
    streamRef.current = null;

    if (result.success && result.schema) {
      setSchema(result.schema);
      setStatus('complete');
      onSchemaGenerated?.(result.schema);
    } else if (result.error && result.error !== 'Cancelled' && status !== 'complete') {
      setError(result.error);
      setStatus('error');
    }
  }, [input, mode, handleEvent, onSchemaGenerated, status]);

  // Edit
  const handleEdit = useCallback(async () => {
    const instruction = editInput.trim();
    if (!instruction || !schema) return;

    setStatus('editing');
    setPhase('editing');
    setPhaseDetail(null);
    setError(null);
    setValidation(null);
    setMessages([]);
    setEditInput('');

    const stream = editSchema(schema, instruction, handleEvent);
    streamRef.current = stream;
    const result = await stream.promise;
    streamRef.current = null;

    if (result.success && result.schema) {
      setSchema(result.schema);
      setStatus('complete');
    } else if (result.error && result.error !== 'Cancelled') {
      setError(result.error);
      setStatus('error');
    }
  }, [editInput, schema, handleEvent]);

  // Validate
  const handleValidate = useCallback(async () => {
    if (!schema) return;
    setStatus('validating');
    const result = await validateSchema(schema);
    setValidation({
      pass: result.success,
      errors: result.errors.map(e => e.message),
      warnings: result.warnings.map(w => w.message),
    });
    setStatus(result.success ? 'complete' : 'error');
  }, [schema]);

  // Cancel
  const handleCancel = useCallback(() => {
    streamRef.current?.cancel();
    streamRef.current = null;
    setStatus('idle');
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    streamRef.current?.cancel();
    streamRef.current = null;
    setStatus('idle');
    setPhase(null);
    setPhaseDetail(null);
    setSchema(null);
    setValidation(null);
    setError(null);
    setMessages([]);
    setIsEditMode(false);
    setEditInput('');
  }, []);

  // Download
  const handleDownload = useCallback(() => {
    if (!schema) return;
    const blob = new Blob([schema], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.orb';
    a.click();
    URL.revokeObjectURL(url);
  }, [schema]);

  // Copy
  const handleCopy = useCallback(() => {
    if (!schema) return;
    navigator.clipboard.writeText(schema).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [schema]);

  // Key handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isEditMode) handleEdit();
      else handleGenerate();
    }
  }, [isEditMode, handleEdit, handleGenerate]);

  return (
    <div className={`${styles.builder} ${compact ? styles.builderCompact : ''} ${className || ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>
            <Zap size={20} strokeWidth={2} />
          </span>
          <span className={styles.headerTitle}>
            {isEditMode ? 'Edit Schema' : 'Build'}
          </span>
        </div>

        {!isEditMode && !showResults && (
          <div className={styles.modeSelector}>
            {(['neural', 'auto', 'llm'] as const).map(m => (
              <button
                key={m}
                className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
                onClick={() => setMode(m)}
                disabled={isProcessing}
              >
                {m === 'neural' ? '🧠 Neural' : m === 'llm' ? '💬 LLM' : '⚡ Auto'}
              </button>
            ))}
          </div>
        )}

        {showResults && !isEditMode && (
          <button className={styles.newBtn} onClick={handleReset}>
            ↻ New
          </button>
        )}
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className={styles.progress}>
          <div className={styles.spinner} />
          <span className={styles.phaseText}>{phase || status}</span>
          {phaseDetail && <span className={styles.phaseDetail}>{phaseDetail}</span>}
          <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={styles.message}>{msg}</div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && status === 'error' && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>
            <AlertTriangle size={18} strokeWidth={2} style={{ display: 'block' }} />
          </span>
          <span className={styles.errorText}>{error}</span>
        </div>
      )}

      {/* Schema Preview */}
      {showResults && (
        <>
          {/* Validation */}
          {validation && (
            <div className={styles.validation}>
              <span className={`${styles.validationIcon} ${validation.pass ? styles.validationPass : styles.validationFail}`}>
                {validation.pass ? '✓' : '✕'}
              </span>
              <span className={`${styles.validationText} ${validation.pass ? styles.validationPass : styles.validationFail}`}>
                {validation.pass ? 'Valid' : `${validation.errors.length} error${validation.errors.length !== 1 ? 's' : ''}`}
              </span>
              {validation.warnings.length > 0 && (
                <span className={styles.validationBadge}>
                  {validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Schema Code */}
          <div className={`${styles.schemaPreview} ${compact ? styles.schemaPreviewCompact : ''}`}>
            <pre className={styles.schemaCode}>{schema}</pre>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={handleDownload}>↓ Download</button>
            <button className={styles.actionBtn} onClick={handleCopy}>⎘ Copy</button>
            <button className={styles.actionBtn} onClick={handleValidate}>✓ Validate</button>
            <button className={styles.actionBtn} onClick={() => setIsEditMode(true)}>✎ Edit</button>
            <span className={styles.actionSpacer} />
            <a
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              href={studioUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Studio ↗
            </a>
          </div>
        </>
      )}

      {/* Input Area */}
      {(!showResults || isEditMode) && (
        <div className={styles.inputArea}>
          <div className={styles.inputRow}>
            <textarea
              className={styles.input}
              value={isEditMode ? editInput : input}
              onChange={e => isEditMode ? setEditInput(e.target.value) : setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEditMode ? 'Describe what to change...' : 'Describe your app idea...'}
              disabled={isProcessing}
              rows={compact ? 1 : 2}
            />
            <button
              className={styles.sendBtn}
              onClick={isEditMode ? handleEdit : handleGenerate}
              disabled={isProcessing || (isEditMode ? !editInput.trim() : !input.trim())}
            >
              ▶
            </button>
          </div>
          {!compact && (
            <div className={styles.inputHint}>
              {isEditMode
                ? 'Describe changes to apply to the current schema'
                : `Mode: ${mode === 'neural' ? 'Neural (fast)' : mode === 'llm' ? 'LLM (thorough)' : 'Auto'} · Press Enter to send`}
            </div>
          )}
        </div>
      )}

      {/* Copied toast */}
      {copied && <div className={styles.copiedToast}>Copied to clipboard</div>}
    </div>
  );
}

export default AlmadarBuilder;
