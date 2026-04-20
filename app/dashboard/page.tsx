'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, getCurrentUser, signOut } from '@/lib/auth';
import { translations, type Language } from '@/lib/translations';
import { useLanguage } from '@/lib/language-context';
import BudgetTracker from '@/components/BudgetTracker';
import ExpenseTracker from '@/components/ExpenseTracker';
import { Bot, IndianRupee, LayoutDashboard, LogOut, PiggyBank, ReceiptText, Wallet } from 'lucide-react';

interface UserProfile {
  full_name: string;
  language: Language;
}

interface DashboardStats {
  totalBudget: number;
  totalExpenses: number;
  remaining: number;
  expenseCount: number;
}

const languageOptions: { value: Language; label: string }[] = [
  { value: 'hi', label: 'हिंदी' },
  { value: 'mr', label: 'मराठी' },
  { value: 'ta', label: 'தமிழ்' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalBudget: 0,
    totalExpenses: 0,
    remaining: 0,
    expenseCount: 0,
  });
  const t = translations[language];

  const fetchStats = async (userId: string, selectedLanguage: Language) => {
    const [budgetResult, expenseResult] = await Promise.all([
      supabase
        .from('budgets')
        .select('monthly_limit')
        .eq('user_id', userId)
        .eq('language', selectedLanguage),
      supabase.from('expenses').select('amount').eq('user_id', userId),
    ]);

    const totalBudget = (budgetResult.data ?? []).reduce((sum, item) => sum + Number(item.monthly_limit ?? 0), 0);
    const totalExpenses = (expenseResult.data ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

    setStats({
      totalBudget,
      totalExpenses,
      remaining: totalBudget - totalExpenses,
      expenseCount: expenseResult.data?.length ?? 0,
    });
  };

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
        await fetchStats(authUser.id, profileData.language);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router, setLanguage]);

  useEffect(() => {
    if (!user) return;
    fetchStats(user.id, language);
  }, [language, user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel rounded-2xl px-6 py-4 text-lg text-foreground">{t.loading}</div>
      </div>
    );
  }

  const navTabStyles = (tab: string) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition ${
      activeTab === tab
        ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(214,185,106,0.22)]'
        : 'border border-white/15 bg-white/8 text-muted-foreground hover:bg-white/15 hover:text-foreground'
    }`;

  return (
    <div className="min-h-screen px-4 pb-8 pt-6 sm:px-8">
      <header className="sticky top-4 z-50 mx-auto max-w-7xl">
        <nav className="glass-panel mesh-border flex items-center justify-between rounded-2xl px-5 py-4 sm:px-7">
          <h1 className="headline-glow text-2xl font-semibold text-primary">{t.appName}</h1>
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

      <main className="mx-auto mt-8 max-w-7xl">
        <div className="glass-panel mesh-border mb-6 rounded-3xl p-6 sm:p-8">
          <h2 className="headline-glow text-3xl font-semibold text-foreground sm:text-4xl">
            {t.welcomeBack}, {userProfile?.full_name?.split(' ')[0]}!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'ta-IN')}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/14 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{t.totalBudget}</p>
              <p className="mt-2 flex items-center gap-1 text-2xl font-semibold text-primary">
                <IndianRupee className="h-5 w-5" />
                {stats.totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-white/14 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{t.totalExpenses}</p>
              <p className="mt-2 flex items-center gap-1 text-2xl font-semibold text-red-200">
                <IndianRupee className="h-5 w-5" />
                {stats.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-white/14 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{t.remainingBudget}</p>
              <p className={`mt-2 flex items-center gap-1 text-2xl font-semibold ${stats.remaining >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                <IndianRupee className="h-5 w-5" />
                {stats.remaining.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-white/14 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{t.thisMonth}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{stats.expenseCount}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={navTabStyles('overview')}
          >
            <span className="inline-flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              अवलोकन
            </span>
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={navTabStyles('budget')}
          >
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {t.budgetTracking}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={navTabStyles('expenses')}
          >
            <span className="inline-flex items-center gap-2">
              <ReceiptText className="h-4 w-4" />
              {t.addExpense}
            </span>
          </button>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-white/15 hover:text-foreground"
          >
            <Bot className="h-4 w-4" />
            {t.chat}
          </Link>
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass-panel rounded-2xl p-5">
              <p className="text-sm text-muted-foreground">{t.totalBudget}</p>
              <p className="mt-3 text-3xl font-semibold text-primary">₹{stats.totalBudget.toLocaleString()}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <PiggyBank className="h-4 w-4" />
                All configured category limits
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <p className="text-sm text-muted-foreground">{t.totalExpenses}</p>
              <p className="mt-3 text-3xl font-semibold text-red-200">₹{stats.totalExpenses.toLocaleString()}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ReceiptText className="h-4 w-4" />
                {stats.expenseCount} recorded transactions
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <p className="text-sm text-muted-foreground">{t.remainingBudget}</p>
              <p className={`mt-3 text-3xl font-semibold ${stats.remaining >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                ₹{stats.remaining.toLocaleString()}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/12">
                <div
                  className={`h-full rounded-full ${stats.totalBudget > 0 && stats.totalExpenses <= stats.totalBudget ? 'bg-emerald-300' : 'bg-red-300'}`}
                  style={{
                    width: `${Math.min(
                      100,
                      stats.totalBudget > 0 ? (stats.totalExpenses / stats.totalBudget) * 100 : 0,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <BudgetTracker userId={user.id} language={language} onDataChange={() => fetchStats(user.id, language)} />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTracker userId={user.id} language={language} onDataChange={() => fetchStats(user.id, language)} />
        )}
      </main>
    </div>
  );
}
