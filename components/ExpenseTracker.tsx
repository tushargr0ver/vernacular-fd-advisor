'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/auth';
import { translations } from '@/lib/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { IndianRupee, Trash2 } from 'lucide-react';

interface ExpenseTrackerProps {
  userId: string;
  language: 'hi' | 'mr' | 'ta';
  onDataChange?: () => void;
}

interface ExpenseRow {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  expense_date: string;
}

const COLORS = ['#D6B96A', '#5DC9CC', '#A56BFF', '#F4A85B', '#F178A6', '#66D28E', '#87A2FF', '#E57F5F', '#A5DC6F', '#4FB2D3'];

export default function ExpenseTracker({ userId, language, onDataChange }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [newExpense, setNewExpense] = useState({
    category: 'food',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const categories = [
    { key: 'food', name: t.food, emoji: '🍔' },
    { key: 'transport', name: t.transport, emoji: '🚗' },
    { key: 'utilities', name: t.utilities, emoji: '💡' },
    { key: 'entertainment', name: t.entertainment, emoji: '🎬' },
    { key: 'healthcare', name: t.healthcare, emoji: '⚕️' },
    { key: 'education', name: t.education, emoji: '📚' },
    { key: 'shopping', name: t.shopping, emoji: '🛍️' },
    { key: 'savings', name: t.savings, emoji: '🏦' },
    { key: 'insurance', name: t.insurance, emoji: '📋' },
  ];

  const fetchExpenses = useCallback(async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false });

    setExpenses((data ?? []) as ExpenseRow[]);
  }, [userId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const { error } = await supabase.from('expenses').insert({
      user_id: userId,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      expense_date: new Date().toISOString().split('T')[0],
    });

    if (!error) {
      setNewExpense({ category: 'food', amount: '', description: '' });
      fetchExpenses();
      onDataChange?.();
    }
    setLoading(false);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await supabase.from('expenses').delete().eq('id', expenseId);
    fetchExpenses();
    onDataChange?.();
  };

  // Calculate totals by category
  const categoryTotals = categories.map((cat) => {
    const total = expenses
      .filter((exp) => exp.category === cat.key)
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      name: cat.name,
      value: total,
    };
  }).filter((item) => item.value > 0);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="glass-panel mesh-border rounded-2xl p-6">
        <h3 className="text-2xl font-semibold text-foreground">{t.addExpense}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Log every transaction with category context for better recommendations.</p>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="rounded-xl border border-white/20 bg-white/8 px-4 py-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              placeholder="₹ रकम"
              required
              className="rounded-xl border border-white/20 bg-white/8 px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            />
          </div>
          <input
            type="text"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            placeholder="विवरण (वैकल्पिक)"
            className="w-full rounded-xl border border-white/20 bg-white/8 px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? t.loading : t.addExpense}
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">{t.totalExpenses}</p>
          <p className="mt-2 inline-flex items-center text-3xl font-semibold text-red-200">
            <IndianRupee className="h-6 w-6" />
            {totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">{t.thisMonth}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{expenses.length} खर्च</p>
        </div>
      </div>

      {categoryTotals.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="mb-4 text-xl font-semibold text-foreground">{t.expenseBreakdown}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryTotals}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ₹${value}`}
                outerRadius={102}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryTotals.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value}`}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.24)',
                  background: 'rgba(22, 22, 34, 0.92)',
                  color: '#f8fafc',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6">
        <h3 className="mb-4 text-xl font-semibold text-foreground">हाल के खर्च</h3>
        <div className="soft-scrollbar max-h-[25rem] space-y-3 overflow-y-auto pr-1">
          {expenses.slice(0, 10).map((expense) => {
            const category = categories.find((c) => c.key === expense.category);
            return (
              <div key={expense.id} className="flex items-center justify-between rounded-xl border border-white/12 bg-white/8 p-4">
                <div className="flex flex-1 items-center gap-4">
                  <span className="text-2xl">{category?.emoji}</span>
                  <div>
                    <p className="font-semibold text-foreground">{category?.name}</p>
                    {expense.description && <p className="text-sm text-muted-foreground">{expense.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground">₹{Number(expense.amount).toLocaleString()}</span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="inline-flex items-center gap-1 text-sm text-red-200 transition hover:text-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    हटाएं
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {expenses.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t.noData}</p>
          </div>
        )}
      </div>
    </div>
  );
}
