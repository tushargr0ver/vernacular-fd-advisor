'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, supabase, signOut } from '@/lib/auth';
import { translations, type Language } from '@/lib/translations';
import { useLanguage } from '@/lib/language-context';
import { Bot, CornerDownLeft, LogOut, Send } from 'lucide-react';

interface UserProfile {
  full_name: string;
  language: Language;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const languageOptions: { value: Language; label: string }[] = [
  { value: 'hi', label: 'हिंदी' },
  { value: 'mr', label: 'मराठी' },
  { value: 'ta', label: 'தமிழ்' },
];

export default function ChatPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    const fetchUser = async () => {
      const authUser = await getCurrentUser();
      if (!authUser) {
        router.push('/login');
        return;
      }

      setUser(authUser);

      const profile = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile.data) {
        const profileData = profile.data as UserProfile;
        setUserProfile(profileData);
        setLanguage(profileData.language);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router, setLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const messageToSend = input.trim();
    const updatedMessages = [...messages, { role: 'user' as const, content: messageToSend }];
    setMessages(updatedMessages);
    setInput('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          language,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const result = (await response.json()) as { content: string };
      setMessages((prev) => [...prev, { role: 'assistant', content: result.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            language === 'ta'
              ? 'மன்னிக்கவும், இப்போது பதில் தர முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
              : language === 'mr'
                ? 'माफ करा, आत्ता प्रतिसाद देता येत नाही. कृपया पुन्हा प्रयत्न करा.'
                : 'माफ़ कीजिए, अभी जवाब नहीं दे पा रहा हूँ। कृपया फिर से प्रयास करें।',
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel rounded-2xl px-6 py-4 text-lg text-foreground">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col px-4 pb-8 pt-6 sm:px-8">
      <header className="sticky top-4 z-50 mx-auto w-full max-w-7xl">
        <nav className="glass-panel mesh-border flex items-center justify-between rounded-2xl px-5 py-4">
          <Link href="/dashboard" className="headline-glow text-2xl font-semibold text-primary">
            {t.appName}
          </Link>
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">
                  {option.label}
                </option>
              ))}
            </select>
            <span className="hidden text-sm text-muted-foreground sm:inline">{userProfile?.full_name}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </button>
          </div>
        </nav>
      </header>

      <div className="mx-auto mt-8 flex w-full max-w-5xl flex-1 flex-col">
        <div className="glass-panel mesh-border mb-4 rounded-3xl p-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs uppercase tracking-[0.16em] text-primary">
            <Bot className="h-3.5 w-3.5" />
            AI Advisor
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground">{t.financialAdvice}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.askAdvisor}</p>
        </div>

        <div className="soft-scrollbar flex-1 space-y-4 overflow-y-auto rounded-3xl border border-white/14 bg-white/6 p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center py-20">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-foreground">{t.financialAdvice}</h3>
                <p className="mt-2 text-muted-foreground">{t.askAdvisor}</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-base ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-[0_12px_26px_rgba(214,185,106,0.22)]'
                      : 'border border-white/16 bg-white/10 text-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="glass-panel mt-4 flex gap-3 rounded-2xl p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.typeMessage}
            className="flex-1 rounded-xl border border-white/20 bg-white/8 px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting ? t.loading : t.send}
          </button>
        </form>
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <CornerDownLeft className="h-3 w-3" />
          Press Enter to send
        </p>
      </div>
    </div>
  );
}
