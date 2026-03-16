import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./AlmadarChat.module.css";

// ─── Types ───────────────────────────────────────────────────────────────

interface ChatMsg {
  id: string;
  role: "user" | "assistant" | "status" | "error";
  content: string;
}

interface AlmadarChatProps {
  /** "inline" renders in-page (for hero). "floating" renders as bottom-right bubble + panel. */
  mode: "inline" | "floating";
}

// ─── Constants ───────────────────────────────────────────────────────────

const API_URL = "https://almadar-agent-server--kflow-b3a39.us-central1.hosted.app/api/agent/deepagent/skill/generate-stream";

const SUGGESTIONS = [
  "What is Almadar?",
  "How does Orb work?",
  "What can Studio do?",
  "Tell me about the AI",
];

// ─── Text Direction Detection ───────────────────────────────────────────

const RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function getDir(text: string): "rtl" | "ltr" {
  // Find the first letter character, skipping markdown symbols, whitespace, punctuation
  const stripped = text.replace(/^[\s#*_>`\-\d.[\]()!]+/, "");
  return RTL_REGEX.test(stripped.charAt(0)) ? "rtl" : "ltr";
}

// ─── SSE Stream Parser ──────────────────────────────────────────────────

interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

async function* parseSSE(response: Response, signal: AbortSignal): AsyncGenerator<SSEEvent> {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        try { yield JSON.parse(trimmed.slice(6)); } catch { /* skip */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Chat Core (shared logic) ───────────────────────────────────────────

function useChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg = text.trim();

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", content: userMsg }]);
    setInput("");
    setStreaming(true);
    setMessages(prev => [...prev, { id: `s-${Date.now()}`, role: "status", content: "Thinking..." }]);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "almadar-assistant",
          message: userMsg,
          noInterrupt: true,
          ...(threadId ? { threadId } : {}),
        }),
        signal: abort.signal,
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      let assistantText = "";
      let hasAssistant = false;

      // Clear status
      setMessages(prev => prev.filter(m => m.role !== "status"));

      for await (const event of parseSSE(res, abort.signal)) {
        if (event.type === "start" && event.data.threadId) {
          setThreadId(event.data.threadId as string);
        }
        if (event.type === "message" && event.data.role === "assistant" && event.data.content) {
          assistantText += event.data.content as string;
          if (!hasAssistant) {
            setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: assistantText }]);
            hasAssistant = true;
          } else {
            setMessages(prev => {
              const copy = [...prev];
              for (let i = copy.length - 1; i >= 0; i--) {
                if (copy[i].role === "assistant") {
                  copy[i] = { ...copy[i], content: assistantText };
                  return copy;
                }
              }
              return prev;
            });
          }
        }
        if (event.type === "error") {
          setMessages(prev => [...prev, {
            id: `e-${Date.now()}`,
            role: "error",
            content: (event.data.error as string) || "Something went wrong.",
          }]);
        }
      }

      setMessages(prev => prev.filter(m => m.role !== "status"));

      if (!hasAssistant) {
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "I'm having trouble connecting right now. Feel free to reach us at hello@almadar.io or on Discord.",
        }]);
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setMessages(prev => prev.filter(m => m.role !== "status"));
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        role: "error",
        content: "Unable to connect. Try again or reach us at hello@almadar.io",
      }]);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [streaming, threadId]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }, [input, send]);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { messages, input, setInput, streaming, send, handleKey, stop, messagesContainerRef };
}

// ─── Floating Chat Panel ────────────────────────────────────────────────

function FloatingPanel({ onClose }: { onClose: () => void }) {
  const { messages, input, setInput, streaming, send, handleKey, messagesContainerRef } = useChat();

  return (
    <div className={styles.floatingPanel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.statusDot} />
          <span className={styles.headerTitle}>Almadar AI</span>
          <span className={styles.betaBadge}>Beta</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          &#x2715;
        </button>
      </div>

      {/* Messages */}
      <div className={styles.messages} ref={messagesContainerRef}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <p className={styles.welcomeTitle}>Ask anything about Almadar</p>
            <p className={styles.welcomeText}>
              I know about our platform, the Orb language, Studio, Services, and the AI pipeline.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map(s => (
                <button key={s} className={styles.suggestion} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => {
          if (msg.role === "user") {
            return <div key={msg.id} className={styles.msgUser} dir={getDir(msg.content)}>{msg.content}</div>;
          }
          if (msg.role === "status") {
            return (
              <div key={msg.id} className={styles.msgStatus}>
                <span className={styles.msgStatusDot} />
                {msg.content}
              </div>
            );
          }
          if (msg.role === "error") {
            return <div key={msg.id} className={styles.msgError}>{msg.content}</div>;
          }
          return <div key={msg.id} className={styles.msgAssistant} dir={getDir(msg.content)}><ReactMarkdown>{msg.content}</ReactMarkdown></div>;
        })}
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <input
          className={styles.inputField}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about Almadar, Orb, Studio..."
          disabled={streaming}
          dir="auto"
        />
        <button
          className={styles.sendBtn}
          onClick={() => send(input)}
          disabled={streaming || !input.trim()}
        >
          {streaming ? "..." : "\u2192"}
        </button>
      </div>
    </div>
  );
}

// ─── Inline Chat (Hero) ─────────────────────────────────────────────────

function InlineChat() {
  const { messages, input, setInput, streaming, send, handleKey, messagesContainerRef } = useChat();
  const hasMessages = messages.length > 0;

  return (
    <div className={styles.inlineWrap}>
      {/* Conversation area — only shown when messages exist */}
      {hasMessages && (
        <div className={styles.inlineMessages} ref={messagesContainerRef}>
          {messages.map(msg => {
            if (msg.role === "user") {
              return <div key={msg.id} className={styles.msgUser} dir={getDir(msg.content)}>{msg.content}</div>;
            }
            if (msg.role === "status") {
              return (
                <div key={msg.id} className={styles.msgStatus}>
                  <span className={styles.msgStatusDot} />
                  {msg.content}
                </div>
              );
            }
            if (msg.role === "error") {
              return <div key={msg.id} className={styles.msgError}>{msg.content}</div>;
            }
            return <div key={msg.id} className={styles.msgAssistant} dir={getDir(msg.content)}><ReactMarkdown>{msg.content}</ReactMarkdown></div>;
          })}
        </div>
      )}

      {/* Input bar — always visible, the main attraction */}
      <div className={styles.inlineInputBar}>
        <div className={styles.inlineInputWrap}>
          <svg className={styles.inlineInputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <input
            className={styles.inlineInput}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me anything about Almadar..."
            disabled={streaming}
            autoComplete="off"
            dir="auto"
          />
          <button
            className={styles.inlineSendBtn}
            onClick={() => send(input)}
            disabled={streaming || !input.trim()}
            aria-label="Send"
          >
            {streaming ? (
              <span className={styles.inlineSpinner} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Suggestion chips — only shown before first message */}
      {!hasMessages && (
        <div className={styles.inlineSuggestions}>
          {SUGGESTIONS.map(s => (
            <button key={s} className={styles.inlineChip} onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────

export default function AlmadarChat({ mode }: AlmadarChatProps) {
  const [open, setOpen] = useState(false);

  if (mode === "inline") {
    return <InlineChat />;
  }

  // Floating mode
  if (!open) {
    return (
      <button
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label="Ask Almadar AI"
        title="Ask Almadar AI"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );
  }

  return <FloatingPanel onClose={() => setOpen(false)} />;
}
