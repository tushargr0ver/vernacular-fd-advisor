'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/auth';
import { translations } from '@/lib/translations';
import { IndianRupee, Trash2 } from 'lucide-react';

interface BudgetTrackerProps {
  userId: string;
  language: 'hi' | 'mr' | 'ta';
  onDataChange?: () => void;
}

interface BudgetRow {
  id: string;
  category: string;
  monthly_limit: number;
}

interface ExpenseRow {
  category: string;
  amount: number;
}

export default function BudgetTracker({ userId, language, onDataChange }: BudgetTrackerProps) {
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [newBudget, setNewBudget] = useState({ category: 'food', limit: '' });
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const categories = [
    { key: 'food', name: t.food },
    { key: 'transport', name: t.transport },
    { key: 'utilities', name: t.utilities },
    { key: 'entertainment', name: t.entertainment },
    { key: 'healthcare', name: t.healthcare },
    { key: 'education', name: t.education },
    { key: 'shopping', name: t.shopping },
    { key: 'savings', name: t.savings },
    { key: 'insurance', name: t.insurance },
  ];

  const fetchBudgets = useCallback(async () => {
    const [budgetData, expenseData] = await Promise.all([
      supabase.from('budgets').select('*').eq('user_id', userId).eq('language', language),
      supabase.from('expenses').select('category, amount').eq('user_id', userId),
    ]);

    setBudgets((budgetData.data ?? []) as BudgetRow[]);
    setExpenses((expenseData.data ?? []) as ExpenseRow[]);
  }, [language, userId]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const { error } = await supabase.from('budgets').insert({
      user_id: userId,
      category: newBudget.category,
      monthly_limit: parseFloat(newBudget.limit),
      language,
    });

    if (!error) {
      setNewBudget({ category: 'food', limit: '' });
      fetchBudgets();
      onDataChange?.();
    }
    setLoading(false);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    await supabase.from('budgets').delete().eq('id', budgetId);
    fetchBudgets();
    onDataChange?.();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel mesh-border rounded-2xl p-6">
        <h3 className="text-2xl font-semibold text-foreground">बजट सेट करें</h3>
        <p className="mt-1 text-sm text-muted-foreground">Define spending limits category-wise and track usage instantly.</p>
        <form onSubmit={handleAddBudget} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select
            value={newBudget.category}
            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
            className="rounded-xl border border-white/20 bg-white/8 px-4 py-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={newBudget.limit}
            onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
            placeholder="₹ सीमा"
            required
            className="rounded-xl border border-white/20 bg-white/8 px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            {t.addExpense}
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => {
          const categoryName = categories.find((c) => c.key === budget.category)?.name || budget.category;
          const spent = expenses
            .filter((expense) => expense.category === budget.category)
            .reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
          const usagePct = budget.monthly_limit > 0 ? Math.min(100, (spent / budget.monthly_limit) * 100) : 0;

          return (
            <div key={budget.id} className="glass-panel rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-foreground">{categoryName}</h4>
                <button
                  onClick={() => handleDeleteBudget(budget.id)}
                  className="inline-flex items-center gap-1 text-sm text-red-200 transition hover:text-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  हटाएं
                </button>
              </div>

              <div className="space-y-3">
                <p className="inline-flex items-center text-2xl font-semibold text-primary">
                  <IndianRupee className="h-5 w-5" />
                  {Number(budget.monthly_limit).toLocaleString()}
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/12">
                  <div
                    className={`h-2 rounded-full ${spent > budget.monthly_limit ? 'bg-red-300' : 'bg-primary'}`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>₹{spent.toLocaleString()} spent</span>
                  <span>{Math.round(usagePct)}% उपयोग किया गया</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="glass-panel rounded-2xl py-12 text-center">
          <p className="text-muted-foreground">{t.noData}</p>
        </div>
      )}
    </div>
  );
}
