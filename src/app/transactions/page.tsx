'use client';

import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc, increment, getDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { ShoppingBag, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTx, setEditingTx] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    const q = query(
      collection(db, 'transactions'), 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(data);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching transactions", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (t: any) => {
    if (!confirm('Are you sure you want to delete this transaction? This will reverse the wallet balance.')) return;
    
    try {
      // 1. Delete the transaction
      await deleteDoc(doc(db, 'transactions', t.id));
      
      // 2. Reverse the wallet balance
      if (t.walletId) {
        const walletRef = doc(db, 'wallets', t.walletId);
        // If it was an EXPENSE, add it back (+). If INCOME, subtract it (-).
        const balanceChange = t.type === 'EXPENSE' ? t.amount : -t.amount;
        await updateDoc(walletRef, {
          balance: increment(balanceChange)
        });
      }

      // 3. Update UI
      setTransactions(transactions.filter(tx => tx.id !== t.id));
    } catch (err) {
      console.error("Error deleting transaction", err);
      alert('Failed to delete transaction');
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        
        <header className={styles.header}>
          <div className={styles.welcome}>
            <h1>Transaction History</h1>
            <p>View, edit, or delete your past transactions.</p>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading transactions...
          </div>
        ) : (
          <div className={styles.card}>
            {transactions.length === 0 ? (
              <EmptyState 
                icon={<ShoppingBag size={32} />}
                title="No Transactions Yet"
                message="Your transaction history is empty. Start adding expenses or income to track your cashflow!"
              />
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Date</th>
                      <th>Wallet</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <AnimatePresence mode="popLayout">
                    {transactions.map(t => (
                      <motion.tr 
                        key={t.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        layout
                      >
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
                          {format(new Date(t.date), 'MMM dd, yyyy h:mm a')}
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>
                          Wallet ending in {t.walletId?.slice(-4) || '****'}
                        </td>
                        <td>
                          <span className={`${styles.txBadge} ${t.type === 'INCOME' ? styles.badgeIncome : styles.badgeExpense}`}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }} className={t.type === 'INCOME' ? styles.txIncome : styles.txExpense}>
                          {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className={`${styles.actionBtn} ${styles.editBtn}`} 
                            title="Edit Transaction"
                            onClick={() => setEditingTx(t)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                            title="Delete Transaction"
                            onClick={() => handleDelete(t)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </table>
              </div>
            )}
          </div>
        )}

        {editingTx && (
          <EditTransactionModal 
            transaction={editingTx} 
            onClose={() => setEditingTx(null)} 
            onSuccess={() => {
              setEditingTx(null);
              // fetchTransactions() is no longer needed since onSnapshot will auto-update
            }} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
