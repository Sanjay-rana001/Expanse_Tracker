'use client';

import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { format, subMonths } from 'date-fns';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#0ea5e9'];

export default function AnalyticsPage() {
  const { user, currencySymbol } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching transactions", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- Data Processing ---
  // 1. Income vs Expense over the last 6 months
  const monthlyDataMap = new Map();
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const monthStr = format(d, 'MMM yyyy');
    monthlyDataMap.set(monthStr, { name: monthStr, Income: 0, Expense: 0 });
  }

  transactions.forEach(t => {
    const monthStr = format(new Date(t.date), 'MMM yyyy');
    if (monthlyDataMap.has(monthStr)) {
      const current = monthlyDataMap.get(monthStr);
      if (t.type === 'INCOME') current.Income += t.amount;
      else current.Expense += t.amount;
      monthlyDataMap.set(monthStr, current);
    }
  });
  const monthlyTrendData = Array.from(monthlyDataMap.values());

  // 2. All-Time Expense Categories
  const categoryMap = new Map();
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  });
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.welcome}>
            <h1>Deep Analytics</h1>
            <p>Analyze your spending habits and financial trends.</p>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading analytics...
          </div>
        ) : (
          <div className={styles.grid}>
            
            {/* 6-Month Trend Bar Chart */}
            <div className={`${styles.card} ${styles.fullChart}`}>
              <h2 className={styles.cardTitle}>Income vs Expense (6 Months)</h2>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                  <Bar dataKey="Income" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Categories Donut */}
            <div className={`${styles.card} ${styles.halfChart}`}>
              <h2 className={styles.cardTitle}>All-Time Expenses by Category</h2>
              {categoryData.length === 0 ? (
                <div style={{ height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                  No expenses to show.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => `${currencySymbol}${Number(value).toFixed(2)}`}
                      contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Income Trend Line Chart */}
            <div className={`${styles.card} ${styles.halfChart}`}>
              <h2 className={styles.cardTitle}>Income Trend</h2>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                    itemStyle={{ color: 'var(--color-success)' }}
                  />
                  <Line type="monotone" dataKey="Income" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
