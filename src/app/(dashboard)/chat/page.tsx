'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button, Spinner } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  User as UserIcon, 
  History, 
  Plus, 
  X, 
  Trash2, 
  Clock, 
  MessageSquare,
  Compass,
} from 'lucide-react';
import { ChatMessage } from '@/types/ai';
import { DreamReference } from '@/components/chat/DreamReference';
import { toast } from '@/components/ui/Toast';

export interface ChatConversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  messageCount: number;
  messages: ChatMessage[];
}

function buildConversation(msgs: ChatMessage[]): ChatConversation {
  const firstUserMsg = msgs.find((m) => m.role === 'user') || msgs[0];
  const lastAiMsg = [...msgs].reverse().find((m) => m.role === 'assistant');
  const lastMsg = msgs[msgs.length - 1];

  let title = firstUserMsg.content.trim();
  if (title.length > 55) {
    title = title.substring(0, 52) + '...';
  }

  const rawPreview = lastAiMsg?.content || lastMsg.content || '';
  const cleanPreview = rawPreview.replace(/^[>#*\s`]+/, '').trim();

  return {
    id: firstUserMsg.id || msgs[0].id,
    title: title || 'Untitled Reflection',
    preview: cleanPreview,
    timestamp: lastMsg.created_at || firstUserMsg.created_at,
    messageCount: msgs.length,
    messages: msgs,
  };
}

function groupMessagesIntoConversations(allMessages: ChatMessage[]): ChatConversation[] {
  if (!allMessages || allMessages.length === 0) return [];

  // Sort chronologically ascending
  const sorted = [...allMessages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const conversations: ChatConversation[] = [];
  let currentGroup: ChatMessage[] = [];

  const SESSION_GAP_MS = 25 * 60 * 1000; // 25 minutes between conversation sessions

  for (let i = 0; i < sorted.length; i++) {
    const msg = sorted[i];

    if (currentGroup.length === 0) {
      currentGroup.push(msg);
      continue;
    }

    const prevMsg = currentGroup[currentGroup.length - 1];
    const prevTime = new Date(prevMsg.created_at).getTime();
    const currTime = new Date(msg.created_at).getTime();
    const gap = currTime - prevTime;

    // Start a new conversation when there is a significant gap between turns
    if ((gap > SESSION_GAP_MS && msg.role === 'user') || gap > 2 * 60 * 60 * 1000) {
      conversations.push(buildConversation(currentGroup));
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  }

  if (currentGroup.length > 0) {
    conversations.push(buildConversation(currentGroup));
  }

  // Return newest conversations first
  return conversations.reverse();
}

function formatConversationDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

function ChatPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const dreamId = searchParams.get('dreamId');
  const initialQuery = searchParams.get('q');
  
  // Fresh chat by default on page open
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contextDream, setContextDream] = useState<{ id: string; title: string } | null>(null);
  
  // History panel state
  const [showHistory, setShowHistory] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const conversations = useMemo(() => {
    return groupMessagesIntoConversations(historyMessages);
  }, [historyMessages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!dreamId || !user) return;
    async function loadDreamContext() {
      const { data } = await supabase
        .from('dreams')
        .select('id, title')
        .eq('id', dreamId)
        .single();
      if (data) {
        setContextDream(data);
        setInputValue(`Reflect with me on my dream: "${data.title || 'Untitled Dream'}"`);
      }
    }
    loadDreamContext();
  }, [dreamId, user, supabase]);

  useEffect(() => {
    if (initialQuery && !dreamId) {
      setInputValue(initialQuery);
    }
  }, [initialQuery, dreamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load history on demand when user opens the history panel
  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (data) {
        setHistoryMessages(data as ChatMessage[]);
      }
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    setShowHistory(true);
    fetchHistory();
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setActiveConversationId(null);
    setShowHistory(false);
  };

  const handleSelectConversation = (conv: ChatConversation) => {
    setActiveConversationId(conv.id);
    const sorted = [...conv.messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    setMessages(sorted);
    setShowHistory(false);
    toast.success('Loaded past conversation');
  };

  const handleDeleteConversation = async (e: React.MouseEvent, conv: ChatConversation) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm(`Delete conversation "${conv.title}"?`)) return;

    const idsToDelete = conv.messages.map((m) => m.id);
    try {
      const { error } = await supabase.from('chat_messages').delete().in('id', idsToDelete);
      if (error) {
        toast.error('Failed to delete conversation');
        return;
      }

      setHistoryMessages((prev) => prev.filter((m) => !idsToDelete.includes(m.id)));
      if (activeConversationId === conv.id || messages.some((m) => idsToDelete.includes(m.id))) {
        setMessages([]);
        setActiveConversationId(null);
      }
      toast.success('Conversation deleted');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast.error('Failed to delete conversation');
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to clear your entire chat history? This cannot be undone.')) return;
    
    setClearingHistory(true);
    try {
      await supabase.from('chat_messages').delete().eq('user_id', user.id);
      setHistoryMessages([]);
      setMessages([]);
      setActiveConversationId(null);
    } catch (err) {
      console.error('Failed to clear history:', err);
    } finally {
      setClearingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !user || isTyping) return;
    
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      created_at: new Date().toISOString(),
      user_id: user.id
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: messages })
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply || data.response,
          created_at: new Date().toISOString(),
          user_id: user.id,
          dream_references: data.dreamReferences,
          provenance: data.provenance,
        };
        
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const errData = await response.json().catch(() => ({}));
        const errText = errData.error || 'Failed to connect with AI Guide.';
        toast.error(errText);
        const fallbackMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "I'm having a quiet moment reflecting right now. Please try asking again in a moment.",
          created_at: new Date().toISOString(),
          user_id: user.id,
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } catch (e) {
      console.error('Failed to send message', e);
      toast.error('Network connection issue. Please check your connection.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestQuestion = (q: string) => {
    setInputValue(q);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 relative">
      {/* Header with Title & Action Controls */}
      <div className="mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Ask Your Dream History</h1>
          <p className="text-[var(--text-muted)] mt-1">Search and reflect across your full dream archive. Grounded in your recorded memories.</p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleNewChat}
            className="flex items-center gap-1.5 text-xs font-medium border-[var(--border-default)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            title="Start a fresh chat"
          >
            <Plus size={15} />
            <span>New Chat</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenHistory}
            className="flex items-center gap-1.5 text-xs font-medium bg-[var(--bg-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] border border-[var(--border-default)]"
            title="View past chat history"
          >
            <History size={15} />
            <span>See History</span>
          </Button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 min-h-0 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] flex flex-col overflow-hidden relative shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-8">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] mb-2 shadow-inner">
                <Sparkles size={32} />
              </div>
              <div>
                <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
                  {contextDream ? `Reflecting on "${contextDream.title || 'your dream'}"` : 'Your Dream History Memory'}
                </h3>
                <p className="text-[var(--text-muted)] max-w-md text-sm leading-relaxed">
                  {contextDream
                    ? 'Explore the emotional undertones, themes, and personal meaning behind this specific dream.'
                    : 'Ask when motifs first appeared, what keeps recurring, or how your dreams have evolved between earlier and recent entries.'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                {(contextDream
                  ? [
                      `What do the key symbols in "${contextDream.title || 'this dream'}" suggest?`,
                      `How does this dream connect to other entries in my journal?`,
                      `What underlying emotional theme is present here?`,
                      `Give me two gentle questions to ponder about this dream.`
                    ]
                  : [
                      "When did I last dream about water?",
                      "How have my dreams changed between earlier and recent entries?",
                      "What recurring places or people keep appearing in my archive?",
                      "What was the very first dream I recorded?"
                    ]
                ).map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => suggestQuestion(q)}
                    className="p-3 text-sm text-left rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all hover:translate-y-[-1px]"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-[var(--accent)] text-white' 
                      : 'bg-[var(--bg-secondary)] text-[var(--accent)] border border-[var(--border-default)]'
                  }`}>
                    {msg.role === 'user' ? <UserIcon size={16} /> : <Sparkles size={16} />}
                  </div>
                  <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-[var(--accent)] text-white rounded-tr-sm shadow-sm' 
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.dream_references && msg.dream_references.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.dream_references.map((ref: any, idx: number) => {
                          const dreamId = typeof ref === 'string' ? ref : ref.id;
                          const title = typeof ref === 'string' ? 'Referenced Dream' : ref.title;
                          const date = typeof ref === 'string' ? undefined : ref.date;
                          return (
                            <DreamReference key={idx} dreamId={dreamId} title={title} date={date} />
                          );
                        })}
                      </div>
                    )}
                    {msg.role === 'assistant' && msg.provenance && msg.provenance.totalArchiveSearched > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-mono">
                        <Compass size={11} className="text-[var(--accent)] shrink-0" />
                        <span>
                          Grounded across {msg.provenance.totalArchiveSearched} archive {msg.provenance.totalArchiveSearched === 1 ? 'entry' : 'entries'}
                          {msg.provenance.earliestDate && msg.provenance.latestDate ? ` (${msg.provenance.earliestDate} – ${msg.provenance.latestDate})` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 flex-row"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] text-[var(--accent)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="px-4 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-tl-sm flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-default)]">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your dreams..."
              className="w-full pl-4 pr-12 py-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl resize-none outline-none focus:border-[var(--accent)] transition-colors min-h-[52px] max-h-32 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              rows={1}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 bottom-2 h-9 w-9 text-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-hover)] p-0"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send size={18} />
            </Button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-[var(--text-muted)]">Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>

      {/* History Drawer / Modal Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            />

            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-default)] z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-[var(--accent)]" size={18} />
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Chat History</h2>
                  {conversations.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-medium">
                      {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {conversations.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      disabled={clearingHistory}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Clear all history"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingHistory ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3">
                    <Spinner size="md" />
                    <p className="text-xs text-[var(--text-muted)]">Loading past conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)]">
                    <MessageSquare size={32} className="mb-2 opacity-40" />
                    <p className="text-sm font-medium text-[var(--text-primary)]">No conversations yet</p>
                    <p className="text-xs mt-1">Reflections and inquiries with your Dream Guide will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                        Past Chats ({conversations.length})
                      </span>
                    </div>

                    {conversations.map((conv) => {
                      const isActive = activeConversationId === conv.id;
                      return (
                        <div
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          role="button"
                          tabIndex={0}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer group relative ${
                            isActive
                              ? 'bg-[var(--accent-soft)]/25 border-[var(--accent)] shadow-sm'
                              : 'bg-[var(--bg-secondary)]/50 border-[var(--border-default)] hover:bg-[var(--bg-card)] hover:border-[var(--accent)]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] line-clamp-1 flex-1">
                              {conv.title}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                              {formatConversationDate(conv.timestamp)}
                            </span>
                          </div>

                          {conv.preview && (
                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                              {conv.preview}
                            </p>
                          )}

                          <div className="mt-2.5 flex items-center justify-between text-[10px]">
                            <span className="px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-muted)] font-mono">
                              {conv.messageCount} {conv.messageCount === 1 ? 'message' : 'messages'}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => handleDeleteConversation(e, conv)}
                                className="p-1 text-[var(--text-muted)] hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete this chat"
                              >
                                <Trash2 size={13} />
                              </button>
                              <span className="text-[var(--accent)] font-medium flex items-center gap-0.5">
                                {isActive ? 'Current' : 'Open'} &rarr;
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/50">
                <Button
                  onClick={handleNewChat}
                  className="w-full justify-center text-xs"
                >
                  <Plus size={14} className="mr-1.5" />
                  Start New Fresh Chat
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-8">
          <Spinner size="lg" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
