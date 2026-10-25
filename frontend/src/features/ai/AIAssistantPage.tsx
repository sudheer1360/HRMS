import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Bot, Send, User, Clock, Lightbulb, BookOpen, HelpCircle,
  ChevronRight, Sparkles,
} from 'lucide-react';
import { Spinner } from '@components/ui/Input';
import { aiService } from '@features/../services/platform.service';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  confidence?: number;
}

// ── Quick Questions ───────────────────────────────────────────────────────────

const QUICK_QUESTIONS = [
  { icon: BookOpen, text: 'What is the leave encashment policy?', category: 'Leave' },
  { icon: HelpCircle, text: 'How do I apply for an advance salary?', category: 'Payroll' },
  { icon: Lightbulb, text: 'What is the WFH policy for my grade?', category: 'Policy' },
  { icon: Clock, text: 'When does the performance review cycle start?', category: 'Performance' },
  { icon: BookOpen, text: 'How many days of casual leave am I entitled to?', category: 'Leave' },
  { icon: HelpCircle, text: 'What documents are needed for expense reimbursement?', category: 'Finance' },
];

const FALLBACK_CONVERSATIONS: any[] = [];

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-500 to-blue-600'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm ${isUser ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
          {msg.content}
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {!isUser && msg.confidence && (
            <span className="text-xs text-gray-400">
              Confidence: {Math.round(msg.confidence * 100)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AIAssistantPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your HR Assistant. I can answer questions about company policies, leave entitlements, payroll queries, benefits, and more. How can I help you today?",
      timestamp: new Date().toISOString(),
      confidence: 1,
    },
  ]);
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { data: historyData } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      try { const { data } = await aiService.listConversations(); return data; }
      catch { return { data: FALLBACK_CONVERSATIONS }; }
    },
  });
  const history: any[] = historyData?.data ?? [];

  const askMut = useMutation({
    mutationFn: (query: string) => aiService.ask(query),
    onSuccess: (data) => {
      const resp = data.data?.response ?? 'I\'m looking into that for you. Please refer to your HR policy document or contact the HR team for accurate guidance.';
      setMessages(prev => [...prev, {
        id: `resp-${Date.now()}`,
        role: 'assistant',
        content: resp,
        timestamp: new Date().toISOString(),
        confidence: data.data?.confidence,
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I\'m unable to connect to the HR knowledge base right now. Please try again shortly or contact HR directly.',
        timestamp: new Date().toISOString(),
      }]);
    },
  });

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    askMut.mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              HR AI Assistant
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI-Powered
              </span>
            </h1>
            <p className="text-xs text-gray-500">Ask anything about HR policies, leaves, payroll, and benefits</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {askMut.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-xs text-gray-400 mb-2">Quick questions</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_QUESTIONS.slice(0, 4).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.text)}
                    className="text-left text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl px-3 py-2.5 transition-all flex items-start gap-2"
                  >
                    <q.icon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask anything about HR policies, leaves, payroll..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-24"
                style={{ minHeight: '44px' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || askMut.isPending}
                className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center transition-colors flex-shrink-0"
              >
                {askMut.isPending ? <Spinner size="sm" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">AI responses are based on your company's HR policies. For complex issues, contact HR directly.</p>
          </div>
        </div>

        {/* Sidebar — recent conversations */}
        <div className="w-64 border-l border-gray-100 bg-gray-50 flex-shrink-0 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Suggested Topics</h3>
          <div className="space-y-1">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.text)}
                className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center gap-2 text-gray-600"
              >
                <q.icon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate">{q.text}</span>
                <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0 ml-auto" />
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mt-6 mb-3">Recent Queries</h3>
              <div className="space-y-1">
                {history.slice(0, 8).map((h: any) => (
                  <button
                    key={h.id}
                    onClick={() => sendMessage(h.query)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white transition-all flex items-center gap-2 text-gray-500"
                  >
                    <Clock className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <span className="truncate">{h.query}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
