'use client';

import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../page.module.css';

export default function WalletsPage() {
  const { user, loading } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // New Wallet Form State
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState('BANK');
  const [newWalletBalance, setNewWalletBalance] = useState('');

  const fetchWallets = async () => {
    if (!user) return;
    try {
      const wQuery = query(collection(db, 'wallets'), where('userId', '==', user.uid));
      const wSnapshot = await getDocs(wQuery);
      const wData = wSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWallets(wData);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [user]);

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'wallets'), {
        name: newWalletName,
        type: newWalletType,
        balance: parseFloat(newWalletBalance) || 0,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setShowAddWallet(false);
      setNewWalletName('');
      setNewWalletBalance('');
      fetchWallets(); // Refresh list
    } catch (err) {
      console.error('Error creating wallet', err);
    }
  };

  if (loading || !user) return null;

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>ExpanseTracker</div>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navItem} style={{ textDecoration: 'none', display: 'block' }}>Dashboard</Link>
          <div className={styles.navItem}>Transactions</div>
          <Link href="/wallets" className={`${styles.navItem} ${styles.navItemActive}`} style={{ textDecoration: 'none', display: 'block' }}>Wallets</Link>
          <div className={styles.navItem}>Analytics</div>
          <div className={styles.navItem}>Settings</div>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.welcome}>
            <h1>Your Wallets</h1>
            <p>Manage your bank accounts, cash, and credit cards.</p>
          </div>
        </header>

        {dataLoading ? (
          <div>Loading wallets...</div>
        ) : (
          <>
            <section className={styles.overviewCards}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Total Across All Wallets</div>
                <div className={styles.cardValue}>${totalBalance.toFixed(2)}</div>
              </div>
            </section>

            <section className={styles.recentSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>All Accounts</h2>
                <button 
                  onClick={() => setShowAddWallet(!showAddWallet)}
                  style={{ padding: '8px 16px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  {showAddWallet ? 'Cancel' : '+ Add Wallet'}
                </button>
              </div>

              {showAddWallet && (
                <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
                  <form onSubmit={handleCreateWallet} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Wallet Name</label>
                      <input type="text" value={newWalletName} onChange={e => setNewWalletName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Type</label>
                      <select value={newWalletType} onChange={e => setNewWalletType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                        <option value="BANK">Bank</option>
                        <option value="CASH">Cash</option>
                        <option value="CREDIT">Credit Card</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Starting Balance ($)</label>
                      <input type="number" step="0.01" value={newWalletBalance} onChange={e => setNewWalletBalance(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                    </div>
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: 'var(--color-success)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, height: '35px' }}>
                      Save Wallet
                    </button>
                  </form>
                </div>
              )}

              {wallets.length === 0 ? (
                <div className={styles.placeholderSection}>
                  No wallets found. Create one above!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {wallets.map(w => (
                    <div key={w.id} style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '8px', textTransform: 'capitalize' }}>
                        {w.type?.toLowerCase() || 'wallet'}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                        {w.name}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: w.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        ${w.balance.toFixed(2)}
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
