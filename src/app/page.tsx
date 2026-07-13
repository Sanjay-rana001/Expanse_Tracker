'use client';

import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import styles from './page.module.css';
import { DashboardActions } from '@/components/DashboardActions';

export default function Home() {
  const { user, loading } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch wallets
        const wQuery = query(collection(db, 'wallets'), where('userId', '==', user.uid));
        const wSnapshot = await getDocs(wQuery);
        const wData = wSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWallets(wData);

        // Fetch recent transactions
        const tQuery = query(
          collection(db, 'transactions'), 
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(5)
        );
        const tSnapshot = await getDocs(tQuery);
        const tData = tSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(tData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !user) return null; // AuthContext handles redirect

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>ExpanseTracker</div>
        <nav className={styles.nav}>
          <div className={`${styles.navItem} ${styles.navItemActive}`}>Dashboard</div>
          <div className={styles.navItem}>Transactions</div>
          <div className={styles.navItem}>Wallets</div>
          <div className={styles.navItem}>Analytics</div>
          <div className={styles.navItem}>Settings</div>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.welcome}>
            <h1>Welcome back, {user.email?.split('@')[0]}!</h1>
            <p>Here's your financial overview for this month.</p>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 600 }}>
              Logout
            </button>
          </div>
        </header>

        <DashboardActions />

        {dataLoading ? (
          <div>Loading your data...</div>
        ) : (
          <>
            <section className={styles.overviewCards}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Total Balance</div>
                <div className={styles.cardValue}>${totalBalance.toFixed(2)}</div>
              </div>
            </section>

            <section className={styles.recentSection}>
              <h2 style={{ marginBottom: '16px' }}>Recent Transactions</h2>
              {transactions.length === 0 ? (
                <div className={styles.placeholderSection}>
                  No transactions yet.
                </div>
              ) : (
                <div className={styles.transactionList}>
                  {transactions.map(t => (
                    <div key={t.id} className={styles.transactionItem} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: 'white', marginBottom: '8px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.category}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {new Date(t.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: t.type === 'INCOME' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
