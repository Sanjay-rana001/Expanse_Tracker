'use client';

import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { AddWalletModal } from '@/components/AddWalletModal';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Wallet, Plus, Trash2 } from 'lucide-react';

interface WalletType {
  id: string;
  name: string;
  balance: number;
}

export default function WalletsPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWallets = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'wallets'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WalletType[];
      setWallets(data);
    } catch (err) {
      console.error("Error fetching wallets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) return;
    
    try {
      await deleteDoc(doc(db, 'wallets', id));
      setWallets(wallets.filter(w => w.id !== id));
    } catch (err) {
      console.error("Error deleting wallet", err);
      alert('Failed to delete wallet');
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.walletsContainer}>
        
        <header className={styles.header}>
          <div className={styles.welcome}>
            <h1>Your Wallets</h1>
            <p>Manage your accounts, cards, and cash balances.</p>
          </div>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Wallet
          </button>
        </header>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading wallets...
          </div>
        ) : (
          <div className={styles.grid}>
            {wallets.length === 0 ? (
              <div className={styles.emptyState}>
                <Wallet size={48} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
                <h3>No wallets found</h3>
                <p style={{ marginTop: '8px', marginBottom: '24px' }}>Create your first wallet to start tracking your finances.</p>
                <button className={styles.addBtn} onClick={() => setIsModalOpen(true)} style={{ margin: '0 auto' }}>
                  <Plus size={18} /> Create Wallet
                </button>
              </div>
            ) : (
              wallets.map(wallet => (
                <div key={wallet.id} className={styles.walletCard}>
                  <div className={styles.walletHeader}>
                    <div className={styles.walletIcon}>
                      <Wallet size={24} />
                    </div>
                    <button className={styles.deleteBtn} onClick={(e) => handleDelete(e, wallet.id)} title="Delete Wallet">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <div className={styles.walletName}>{wallet.name}</div>
                    <div className={styles.walletBalance}>
                      ${wallet.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {isModalOpen && (
          <AddWalletModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchWallets();
            }} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
