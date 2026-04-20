'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { translations, type Language } from '@/lib/translations';
import { useLanguage } from '@/lib/language-context';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

const languageOptions: { value: Language; label: string }[] = [
  { value: 'hi', label: 'हिंदी' },
  { value: 'mr', label: 'मराठी' },
  { value: 'ta', label: 'தமிழ்' },
];

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute left-0 top-0 z-10 w-full px-4 pt-6 sm:px-8">
        <div className="glass-panel mesh-border mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-5 py-3">
          <Link href="/" className="headline-glow text-2xl font-semibold text-primary">
            {t.appName}
          </Link>
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
        </div>
      </div>

      <div className="grid w-full max-w-6xl gap-6 pt-20 md:grid-cols-[0.9fr_1.1fr]">
        <aside className="glass-panel rounded-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Secure access</p>
          <h1 className="headline-glow mt-4 text-4xl font-semibold text-foreground">{t.login}</h1>
          <p className="mt-5 text-muted-foreground">
            Get back to your personal finance cockpit and continue tracking goals in your preferred language.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/14"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </aside>

        <div className="glass-panel mesh-border rounded-3xl p-8 sm:p-10">
          <h2 className="text-3xl font-semibold text-foreground">{t.login}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.dontHaveAccount}{' '}
            <Link href="/signup" className="font-semibold text-primary transition hover:brightness-110">
              {t.signupHere}
            </Link>
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/15 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/18 bg-white/7 px-10 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/18 bg-white/7 px-10 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? t.loading : t.login}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.dontHaveAccount}{' '}
            <Link href="/signup" className="font-semibold text-primary transition hover:brightness-110">
              {t.signup}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
