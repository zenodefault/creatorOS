'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react';

import { AppShell } from '../../components/AppShell';
import { useApiData } from '../../hooks/useApiData';
import { useAuth } from '../../hooks/useAuth';
import { ApiError, apiSend } from '../../lib/api-client';
import type { AssistantMessage } from '../../lib/types';

const SUGGESTIONS = [
  'What should I post next?',
  'How is my workspace doing?',
  'What is scheduled?',
  'Are my assets protected?',
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const { data, error, loading } = useApiData<{ messages: AssistantMessage[] }>(user ? '/api/assistant' : null);

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (data) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, sending]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length === 0 || sending) return;

    setFailure(null);
    setInput('');
    setSending(true);

    const optimistic: AssistantMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);

    try {
      const response = await apiSend<{ assistantMessage: AssistantMessage }>('/api/assistant', 'POST', {
        message: trimmed,
      });
      setMessages((current) => [...current, response.assistantMessage]);
    } catch (cause) {
      setMessages((current) => current.filter((message) => message.id !== optimistic.id));
      setFailure(cause instanceof ApiError ? cause.message : 'The assistant could not answer.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell active="chatbot">
      <div className="flex flex-1 flex-col p-6 xl:p-10">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Assistant</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Ask for ideas, planning help, or workspace advice. Your recent workspace data helps ground each reply.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-surface-light p-4 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
            <div className="flex min-h-[320px] flex-1 flex-col gap-4 overflow-y-auto p-2" aria-live="polite">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading your history…
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <p className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                    <Sparkles className="w-4 h-4 text-primary" /> Start with one of these
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => ask(suggestion)}
                        className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div
                      className={
                        message.role === 'user'
                          ? 'flex max-w-[80%] items-start gap-2 rounded-2xl bg-primary px-4 py-3 text-sm text-white'
                          : 'flex max-w-[85%] items-start gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                      }
                    >
                      {message.role === 'user' ? (
                        <User className="mt-0.5 w-4 h-4 flex-shrink-0 opacity-80" />
                      ) : (
                        <Bot className="mt-0.5 w-4 h-4 flex-shrink-0 text-primary" />
                      )}
                      <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))
              )}

              {sending && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
                </div>
              )}

              <div ref={endRef} />
            </div>

            {failure && (
              <p role="alert" className="px-2 text-sm font-medium text-red-600 dark:text-red-400">
                {failure}
              </p>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800"
            >
              <input
                aria-label="Ask the assistant"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask for content ideas, planning help, or workspace advice…"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={sending || input.trim().length === 0}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </form>
          </div>

          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  disabled={sending}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
