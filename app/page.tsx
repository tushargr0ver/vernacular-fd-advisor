'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { translations } from '@/lib/translations';
import { useLanguage } from '@/lib/language-context';
import type { Language } from '@/lib/translations';
import { ArrowRight, Bot, ChartNoAxesCombined, Languages, Sparkles } from 'lucide-react';

const languageOptions: { value: Language; label: string }[] = [
  { value: 'hi', label: 'हिंदी' },
  { value: 'mr', label: 'मराठी' },
  { value: 'ta', label: 'தமிழ்' },
];

const copyByLanguage: Record<Language, { headline: string; subline: string }> = {
  hi: {
    headline: 'आपकी कमाई, आपकी भाषा, आपकी वित्तीय रणनीति',
    subline:
      'AI साथी जो रोज़मर्रा के खर्च, बजट अनुशासन और बचत निर्णयों को आपकी सांस्कृतिक और आर्थिक वास्तविकताओं के साथ समझता है।',
  },
  mr: {
    headline: 'तुमची कमाई, तुमची भाषा, तुमची आर्थिक दिशा',
    subline:
      'AI सल्लागार जो तुमचे खर्च, बजेट आणि बचत ध्येये स्थानिक संदर्भात समजून व्यवहार्य मार्गदर्शन देतो.',
  },
  ta: {
    headline: 'உங்கள் வருமானம், உங்கள் மொழி, உங்கள் நிதி தெளிவு',
    subline:
      'உங்கள் தினசரி செலவுகள், சேமிப்பு நோக்கங்கள் மற்றும் பண ஒழுக்கத்திற்கு பொருத்தமான AI நிதி துணை.',
  },
};

export default function Home() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const t = translations[language];

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthed(!!user);
    };
    checkAuth();
  }, []);

  if (isAuthed === true) {
    router.push('/dashboard');
    return null;
  }

  const localizedCopy = copyByLanguage[language];

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-10 pt-6 sm:px-8">
      <header className="mx-auto max-w-7xl">
        <nav className="glass-panel mesh-border flex items-center justify-between rounded-2xl px-5 py-4 sm:px-7">
          <div>
            <p className="headline-glow text-2xl font-semibold text-primary sm:text-3xl">{t.appName}</p>
            <p className="mt-1 text-xs text-muted-foreground">Vernacular Finance Operating System</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">
                  {option.label}
                </option>
              ))}
            </select>
            <Link
              href="/login"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              {t.login}
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto mt-10 grid max-w-7xl gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <section className="glass-panel mesh-border rounded-3xl p-8 sm:p-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Intelligent local finance
          </p>
          <h1 className="headline-glow max-w-2xl text-4xl leading-tight font-semibold text-balance text-foreground sm:text-6xl">
            {localizedCopy.headline}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{localizedCopy.subline}</p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px] hover:brightness-110"
            >
              {t.signup}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/8 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white/14"
            >
              {t.login}
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="glass-panel mesh-border rounded-3xl p-6">
            <p className="mb-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">Experience stack</p>
            <div>
              <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/20 p-2 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Context-aware advisor</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">Advice in Hindi, Marathi, and Tamil with Indian money context.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent/25 p-2 text-accent">
                    <ChartNoAxesCombined className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Budget + expense cockpit</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">Actionable tracking that prioritizes clarity over clutter.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-violet-300/20 p-2 text-violet-300">
                    <Languages className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Language-first UX</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">Switch your preferred language instantly across the product.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <p className="text-sm text-muted-foreground">Trusted flow</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
              <div className="rounded-xl border border-white/12 bg-white/8 px-2 py-3 font-medium text-foreground">Sign up</div>
              <div className="rounded-xl border border-white/12 bg-white/8 px-2 py-3 font-medium text-foreground">Track</div>
              <div className="rounded-xl border border-white/12 bg-white/8 px-2 py-3 font-medium text-foreground">Grow</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
