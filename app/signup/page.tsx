'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { translations, type Language } from '@/lib/translations';
import { useLanguage } from '@/lib/language-context';
import { ArrowLeft, Landmark, Lock, Mail, UserRound } from 'lucide-react';

const languageOptions: { value: Language; label: string }[] = [
  { value: 'hi', label: 'हिंदी' },
  { value: 'mr', label: 'मराठी' },
  { value: 'ta', label: 'தமிழ்' },
];

export default function SignupPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    monthlyIncome: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      parseFloat(formData.monthlyIncome),
      language
    );

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError('Failed to create account. Please try again.');
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

      <div className="grid w-full max-w-6xl gap-6 pt-20 md:grid-cols-[0.85fr_1.15fr]">
        <aside className="glass-panel rounded-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Onboarding</p>
          <h1 className="headline-glow mt-4 text-4xl font-semibold text-foreground">{t.signup}</h1>
          <p className="mt-5 text-muted-foreground">
            Build your profile once and get personalized guidance in your own language with every session.
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
          <h2 className="text-3xl font-semibold text-foreground">{t.signup}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.alreadyHaveAccount}{' '}
            <Link href="/login" className="font-semibold text-primary transition hover:brightness-110">
              {t.loginHere}
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
                {t.fullName}
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/18 bg-white/7 px-10 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/18 bg-white/7 px-10 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                {t.monthlyIncome}
              </label>
              <div className="relative">
                <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/18 bg-white/7 px-10 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                  placeholder="₹50,000"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? t.loading : t.signup}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.alreadyHaveAccount}{' '}
            <Link href="/login" className="font-semibold text-primary transition hover:brightness-110">
              {t.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
