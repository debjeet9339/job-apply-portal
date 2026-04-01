'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Trash2,
  Sun,
  Moon,
  Briefcase,
  ShieldCheck,
  Wand2,
  RotateCcw,
} from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type CareerChatResponse = {
  reply: string;
  suggestions: string[];
};

type ThemeMode = 'light' | 'dark';

type ParsedBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

const initialMessage: Message = {
  role: 'assistant',
  content:
    'Hi, I am your AI Career Assistant.\n\nI can help you with:\n- resume tips\n- interview preparation\n- skill roadmap\n- project suggestions',
};

const defaultSuggestions = [
  'Improve my resume',
  'Give me interview questions',
  'Create a skill roadmap',
  'Suggest portfolio projects',
];

function parseMessageBlocks(content: string): ParsedBlock[] {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line, index, arr) => {
      if (line !== '') return true;
      return arr[index - 1] !== '';
    });

  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line) {
      i += 1;
      continue;
    }

    const isOrdered = /^\d+\.\s+/.test(line);
    const isUnordered = /^[-*•]\s+/.test(line);
    const isHeading =
      /^[A-Za-z][A-Za-z0-9\s/&()+-]{1,40}:$/.test(line) &&
      !isOrdered &&
      !isUnordered;

    if (isHeading) {
      blocks.push({
        type: 'heading',
        text: line.replace(/:$/, ''),
      });
      i += 1;
      continue;
    }

    if (isOrdered) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, '').trim());
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (isUnordered) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s+/, '').trim());
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i] &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^[-*•]\s+/.test(lines[i]) &&
      !/^[A-Za-z][A-Za-z0-9\s/&()+-]{1,40}:$/.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i += 1;
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: paragraphLines.join(' '),
      });
    }
  }

  return blocks;
}

function renderInlineLabel(text: string) {
  const match = text.match(/^([A-Za-z][A-Za-z\s/&()+-]{1,30}):\s(.+)$/);
  if (!match) return text;

  return (
    <>
      <span className="font-semibold">{match[1]}:</span> {match[2]}
    </>
  );
}

function AssistantFormattedMessage({
  content,
  isDark,
}: {
  content: string;
  isDark: boolean;
}) {
  const blocks = useMemo(() => parseMessageBlocks(content), [content]);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <div
              key={index}
              className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'
                }`}
            >
              {block.text}
            </div>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p
              key={index}
              className={`text-sm leading-7 sm:text-[15px] ${isDark ? 'text-slate-100' : 'text-slate-700'
                }`}
            >
              {renderInlineLabel(block.text)}
            </p>
          );
        }

        if (block.type === 'ul') {
          return (
            <ul key={index} className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-3">
                  <span
                    className={`mt-2 h-2 w-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'
                      }`}
                  />
                  <span
                    className={`text-sm leading-7 sm:text-[15px] ${isDark ? 'text-slate-100' : 'text-slate-700'
                      }`}
                  >
                    {renderInlineLabel(item)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol') {
          return (
            <div key={index} className="space-y-3">
              {block.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDark
                      ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20'
                      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      }`}
                  >
                    {itemIndex + 1}
                  </div>
                  <p
                    className={`pt-0.5 text-sm leading-7 sm:text-[15px] ${isDark ? 'text-slate-100' : 'text-slate-700'
                      }`}
                  >
                    {renderInlineLabel(item)}
                  </p>
                </div>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function CareerAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const savedChat = localStorage.getItem('career_assistant_chat');
    const savedTheme = localStorage.getItem(
      'career_assistant_theme'
    ) as ThemeMode | null;

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    } else {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (error) {
        console.error('Failed to parse saved chat:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('career_assistant_theme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    localStorage.setItem('career_assistant_chat', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getLastUserIndex = (chatMessages: Message[]) => {
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      if (chatMessages[i].role === 'user') {
        return i;
      }
    }
    return -1;
  };

  const fetchAssistantReply = async (
    messageText: string,
    historyForApi: Message[]
  ): Promise<CareerChatResponse> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/career-chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          history: historyForApi,
          user_profile: {
            name: 'Debjeet Halder',
            target_role: 'Full Stack Developer',
            skills: 'Next.js, FastAPI, MongoDB, Tailwind CSS',
            experience: 'Fresher',
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error('Failed to get response from server');
    }

    return res.json();
  };

  const sendMessage = async (preset?: string) => {
    const finalMessage = (preset || input).trim();

    if (!finalMessage || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: finalMessage,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const data = await fetchAssistantReply(finalMessage, messages);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'No reply received from assistant.',
        },
      ]);

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Career chat error:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Connection Issue:\n\nUnable to connect to the AI Career Assistant right now.\n\nPlease check:\n- backend server is running\n- Ollama is running\n- API URL is correct',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const regenerateLastAnswer = async () => {
    if (loading) return;

    const lastUserIndex = getLastUserIndex(messages);

    if (lastUserIndex === -1) return;

    const lastUserMessage = messages[lastUserIndex];
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;

    const historyBeforeLastUser = messages.slice(0, lastUserIndex);
    const baseMessages = messages.slice(0, lastUserIndex + 1);

    setMessages(baseMessages);
    setLoading(true);

    try {
      const data = await fetchAssistantReply(
        lastUserMessage.content,
        historyBeforeLastUser
      );

      setMessages([
        ...baseMessages,
        {
          role: 'assistant',
          content: data.reply || 'No reply received from assistant.',
        },
      ]);

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Regenerate answer error:', error);

      setMessages([
        ...baseMessages,
        {
          role: 'assistant',
          content:
            'Connection Issue:\n\nUnable to regenerate the answer right now.\n\nPlease check:\n- backend server is running\n- Ollama is running\n- API URL is correct',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([initialMessage]);
    setSuggestions(defaultSuggestions);
    localStorage.removeItem('career_assistant_chat');
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  const pageClass = isDark
    ? 'min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_55%)] text-white'
    : 'min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f8fafc_50%)] text-slate-900';

  const shellClass = isDark
    ? 'border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl'
    : 'border border-slate-200 bg-white/80 shadow-2xl shadow-slate-200/70 backdrop-blur-xl';

  const mutedText = isDark ? 'text-slate-300' : 'text-slate-600';
  const subtleText = isDark ? 'text-slate-400' : 'text-slate-500';

  const suggestionClass = isDark
    ? 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50';

  const inputClass = isDark
    ? 'border border-white/10 bg-black/20 text-white placeholder:text-slate-400 focus:border-emerald-500'
    : 'border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500';

  const secondaryButton = isDark
    ? 'border border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
    : 'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100';

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className={`mb-6 overflow-hidden rounded-[28px] ${shellClass}`}>
          <div className="relative p-5 sm:p-7">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-500/15 p-3 ring-1 ring-emerald-400/20">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>

                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-500 ring-1 ring-emerald-400/20">
                    <Wand2 className="h-3.5 w-3.5" />
                    Smart Career Guidance
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
                    AI Career Assistant
                  </h1>

                  <p className={`mt-3 max-w-2xl text-sm leading-7 sm:text-base ${mutedText}`}>
                    Get structured help for resume improvement, interview prep,
                    skill roadmaps, and portfolio direction.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div
                      className={`rounded-2xl px-4 py-3 ${isDark
                        ? 'bg-white/5 ring-1 ring-white/10'
                        : 'bg-white ring-1 ring-slate-200'
                        }`}
                    >
                      <div className={`mb-1 text-xs font-medium uppercase tracking-[0.18em] ${subtleText}`}>
                        Focus
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Briefcase className="h-4 w-4 text-emerald-500" />
                        Career Growth
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 ${isDark
                        ? 'bg-white/5 ring-1 ring-white/10'
                        : 'bg-white ring-1 ring-slate-200'
                        }`}
                    >
                      <div className={`mb-1 text-xs font-medium uppercase tracking-[0.18em] ${subtleText}`}>
                        Output
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Sparkles className="h-4 w-4 text-cyan-500" />
                        Structured Answers
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 ${isDark
                        ? 'bg-white/5 ring-1 ring-white/10'
                        : 'bg-white ring-1 ring-slate-200'
                        }`}
                    >
                      <div className={`mb-1 text-xs font-medium uppercase tracking-[0.18em] ${subtleText}`}>
                        Experience
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck className="h-4 w-4 text-violet-500" />
                        Fresher Friendly
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${isDark
                    ? 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>

                <button
                  onClick={clearChat}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${secondaryButton}`}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Chat
                </button>
              </div>
            </div>

            <div className="relative mt-6 flex flex-wrap gap-3">
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${suggestionClass}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`overflow-hidden rounded-[28px] ${shellClass}`}>
          <div
            className={`flex items-center justify-between border-b px-5 py-4 sm:px-6 ${isDark ? 'border-white/10' : 'border-slate-200'
              }`}
          >
            <div>
              <h2 className="text-lg font-semibold">Conversation</h2>
              <p className={`text-sm ${subtleText}`}>
                Ask about resume, interviews, projects, or learning path.
              </p>
            </div>

            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-600'
                }`}
            >
              {loading ? 'Assistant is typing' : 'Ready'}
            </div>
          </div>

          <div className="h-[62vh] overflow-y-auto px-4 py-5 sm:px-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'user' ? (
                    <div className="max-w-[90%] sm:max-w-[78%]">
                      <div className="mb-2 flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
                        <span>You</span>
                        <User className="h-3.5 w-3.5" />
                      </div>

                      <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-4 text-white shadow-lg shadow-emerald-500/20 sm:px-5">
                        <p className="whitespace-pre-wrap text-sm leading-7 sm:text-[15px]">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[96%] sm:max-w-[82%]">
                      <div className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${subtleText}`}>
                        <Bot className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Assistant</span>
                      </div>

                      <div
                        className={`overflow-hidden rounded-[24px] border ${isDark
                          ? 'border-white/10 bg-white/5'
                          : 'border-slate-200 bg-white'
                          }`}
                      >
                        <div
                          className={`flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 ${isDark
                              ? 'border-white/10 bg-emerald-500/10'
                              : 'border-slate-200 bg-emerald-50'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="rounded-xl bg-emerald-500/15 p-2">
                              <Sparkles className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Career Assistant Response</p>
                              <p className={`text-xs ${subtleText}`}>
                                Structured guidance for your next step
                              </p>
                            </div>
                          </div>

                          {index === messages.length - 1 && messages.some((m) => m.role === 'user') && (
                            <button
                              onClick={regenerateLastAnswer}
                              disabled={loading}
                              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${isDark
                                  ? 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Regenerate
                            </button>
                          )}
                        </div>

                        <div className="px-4 py-4 sm:px-5 sm:py-5">
                          <AssistantFormattedMessage
                            content={message.content}
                            isDark={isDark}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[82%]">
                    <div className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${subtleText}`}>
                      <Bot className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Assistant</span>
                    </div>

                    <div
                      className={`rounded-[24px] border px-5 py-4 ${isDark
                        ? 'border-white/10 bg-white/5'
                        : 'border-slate-200 bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          <div
            className={`border-t p-4 sm:p-5 ${isDark ? 'border-white/10 bg-black/10' : 'border-slate-200 bg-white/60'
              }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                  }}
                  placeholder="Ask about resume, interviews, roadmap, projects..."
                  className={`w-full rounded-2xl px-4 py-3.5 pr-12 text-sm outline-none transition sm:text-[15px] ${inputClass}`}
                />
                <Sparkles
                  className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                />
              </div>

              <button
                onClick={() => sendMessage()}
                disabled={loading}
                className="inline-flex min-w-[132px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>

            <p className={`mt-3 text-xs ${subtleText}`}>
              Tip: ask for structured answers like “Give me a 30-day roadmap with steps”.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}