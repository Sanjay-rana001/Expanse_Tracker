'use client';

import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import styles from './page.module.css';
import { DashboardActions } from '@/components/DashboardActions';
import { SetBudgetModal } from '@/components/SetBudgetModal';
import Link from 'next/link';
import { format, subDays, isSameMonth } from 'date-fns';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, ShoppingBag, Target
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#0ea5e9'];

export default function Home() {
  const { user, loading } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [budget, setBudget] = useState<number>(0);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch User Settings (Budget)
        const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
        if (settingsDoc.exists()) {
          setBudget(settingsDoc.data().budget || 0);
        }

        // Fetch wallets
        const wQuery = query(collection(db, 'wallets'), where('userId', '==', user.uid));
        const wSnapshot = await getDocs(wQuery);
        const wData = wSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWallets(wData);

        // Fetch recent transactions for table (last 10)
        const tQuery = query(
          collection(db, 'transactions'), 
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(10)
        );
        const tSnapshot = await getDocs(tQuery);
        const tData = tSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(tData);

        // Fetch ALL transactions for charts (in production, we'd paginate or filter by date range)
        const allTQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid));
        const allTSnapshot = await getDocs(allTQuery);
        const allTData = allTSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllTransactions(allTData);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !user) return null; // AuthContext handles redirect

  // --- Calculations ---
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const currentMonth = new Date();
  const monthlyTx = allTransactions.filter(t => isSameMonth(new Date(t.date), currentMonth));
  
  const monthlyIncome = monthlyTx.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = monthlyTx.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const netSavings = monthlyIncome - monthlyExpense;

  // --- Chart Data Preparation ---
  // 1. Cashflow (Last 7 Days)
  const cashflowData = Array.from({length: 7}).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayStr = format(d, 'MMM dd');
    const dayTx = allTransactions.filter(t => format(new Date(t.date), 'MMM dd') === dayStr);
    
    return {
      name: dayStr,
      Income: dayTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
      Expense: dayTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
    };
  });

  // 2. Expenses By Category
  const categoryMap = new Map();
  allTransactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  });
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

  return (
    <DashboardLayout>
      <header className={styles.header}>
        <div className={styles.welcome}>
          <h1>Overview</h1>
          <p>Here's what's happening with your finances today.</p>
        </div>
        <div className={styles.headerActions}>
          <DashboardActions />
        </div>
      </header>

        {dataLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--color-text-secondary)' }}>
            Loading analytics...
          </div>
        ) : (
          <div className={styles.grid}>
            
            {/* STAT CARDS */}
            <div className={`${styles.card} ${styles.statCard}`}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                  <Wallet size={18} />
                </div>
                Total Balance
              </div>
              <div className={styles.statValue}>${totalBalance.toFixed(2)}</div>
              <div className={styles.statTrend}>
                <span className={styles.trendUp}><TrendingUp size={14} /> +2.5%</span> from last month
              </div>
            </div>

            <div className={`${styles.card} ${styles.statCard}`}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                  <ArrowUpRight size={18} />
                </div>
                Monthly Income
              </div>
              <div className={styles.statValue}>${monthlyIncome.toFixed(2)}</div>
            </div>

            <div className={`${styles.card} ${styles.statCard}`}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon} style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-text-primary)' }}>
                  <ArrowDownRight size={18} />
                </div>
                Monthly Expenses
              </div>
              <div className={styles.statValue}>${monthlyExpense.toFixed(2)}</div>
            </div>

            <div className={`${styles.card} ${styles.statCard}`}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
                  <DollarSign size={18} />
                </div>
                Net Savings
              </div>
              <div className={styles.statValue}>${netSavings.toFixed(2)}</div>
            </div>

            {/* BUDGET GOALS */}
            <div className={styles.budgetCard}>
              <div className={styles.budgetHeader}>
                <h2><Target size={20} color="var(--color-primary)" /> Monthly Budget</h2>
                <button className={styles.editBudgetBtn} onClick={() => setIsBudgetModalOpen(true)}>
                  {budget > 0 ? 'Edit Limit' : 'Set Limit'}
                </button>
              </div>
              
              {budget > 0 ? (
                <div>
                  <div className={styles.budgetStats}>
                    <span className={styles.budgetSpent}>${monthlyExpense.toFixed(2)} spent</span>
                    <span className={styles.budgetTotal}>of ${budget.toFixed(2)}</span>
                  </div>
                  <div className={styles.progressBarTrack}>
                    <div 
                      className={`${styles.progressBarFill} ${
                        (monthlyExpense / budget) > 0.9 ? styles.progressDanger : 
                        (monthlyExpense / budget) > 0.75 ? styles.progressWarning : 
                        styles.progressGood
                      }`}
                      style={{ width: `${Math.min((monthlyExpense / budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  You haven't set a monthly budget yet. Set a limit to track your spending!
                </div>
              )}
            </div>

            {/* CHARTS */}
            <div className={`${styles.card} ${styles.chartCard}`}>
              <h2 className={styles.cardTitle}>Cashflow (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3f3f46" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3f3f46" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Area type="monotone" dataKey="Income" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Expense" stroke="#52525b" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className={`${styles.card} ${styles.donutCard}`}>
              <h2 className={styles.cardTitle}>Expenses by Category</h2>
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
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--color-text-primary)' }}
                      formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className={`${styles.card} ${styles.tableCard}`}>
              <h2 className={styles.cardTitle}>Recent Transactions</h2>
              {transactions.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No transactions yet. Start adding some!
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Date</th>
                        <th>Wallet</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(t => (
                        <tr key={t.id}>
                          <td>
                            <div className={styles.txCategory}>
                              <div className={styles.txIcon}>
                                <ShoppingBag size={18} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.category}</div>
                                {t.notes && <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{t.notes}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--color-text-secondary)' }}>
                            {format(new Date(t.date), 'MMM dd, yyyy')}
                          </td>
                          <td style={{ color: 'var(--color-text-secondary)' }}>
                            {/* In a real app, we'd map walletId to walletName */}
                            Wallet ending in {t.walletId?.slice(-4) || '****'}
                          </td>
                          <td>
                            <span className={`${styles.txBadge} ${t.type === 'INCOME' ? styles.badgeIncome : styles.badgeExpense}`}>
                              Completed
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }} className={t.type === 'INCOME' ? styles.txIncome : styles.txExpense}>
                            {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
        {isBudgetModalOpen && (
          <SetBudgetModal 
            currentBudget={budget}
            onClose={() => setIsBudgetModalOpen(false)} 
            onSuccess={() => {
              setIsBudgetModalOpen(false);
              // Simple reload to fetch new budget, or we could just update the state locally 
              // for better UX
              window.location.reload(); 
            }} 
          />
        )}
    </DashboardLayout>
  );
}
