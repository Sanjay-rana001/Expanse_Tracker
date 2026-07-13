'use client';

import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { AddWalletModal } from '@/components/AddWalletModal';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
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

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const q = query(collection(db, 'wallets'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WalletType[];
      setWallets(data);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching wallets", err);
      setLoading(false);
    });

    return () => unsubscribe();
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
              <EmptyState 
                icon={<Wallet size={32} />}
                title="No Wallets Found"
                message="Create your first wallet to start tracking your finances and organizing your money."
              />
            ) : (
              <AnimatePresence mode="popLayout">
                {wallets.map(wallet => (
                  <motion.div 
                    key={wallet.id} 
                    className={styles.walletCard}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    layout
                  >
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
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {isModalOpen && (
          <AddWalletModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
            }} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
