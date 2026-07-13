'use client';

import React, { useState, useEffect } from 'react';
import styles from './AddTransactionModal.module.css'; // Reusing the same premium CSS
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface EditTransactionModalProps {
  transaction: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditTransactionModal = ({ transaction, onClose, onSuccess }: EditTransactionModalProps) => {
  const { user } = useAuth();
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [walletId, setWalletId] = useState(transaction.walletId);
  const [notes, setNotes] = useState(transaction.notes || '');
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchWallets = async () => {
      const wQuery = query(collection(db, 'wallets'), where('userId', '==', user.uid));
      const wSnapshot = await getDocs(wQuery);
      setWallets(wSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchWallets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newAmount = parseFloat(amount);
      const oldAmount = transaction.amount;
      const oldType = transaction.type;
      
      // Calculate how much the wallet balance needs to change
      // First, "undo" the old transaction
      let balanceAdjustment = 0;
      if (oldType === 'EXPENSE') balanceAdjustment += oldAmount; // refund old expense
      else balanceAdjustment -= oldAmount; // remove old income
      
      // Then, "apply" the new transaction
      if (type === 'EXPENSE') balanceAdjustment -= newAmount;
      else balanceAdjustment += newAmount;

      // Update Transaction
      await updateDoc(doc(db, 'transactions', transaction.id), {
        amount: newAmount,
        type,
        category,
        walletId,
        notes
      });

      // Update Wallet Balance
      if (transaction.walletId === walletId) {
        await updateDoc(doc(db, 'wallets', walletId), {
          balance: increment(balanceAdjustment)
        });
      } else {
        // If they changed the wallet, we must refund the old wallet entirely, and charge the new wallet entirely
        let oldWalletRefund = oldType === 'EXPENSE' ? oldAmount : -oldAmount;
        let newWalletCharge = type === 'EXPENSE' ? -newAmount : newAmount;
        
        await updateDoc(doc(db, 'wallets', transaction.walletId), { balance: increment(oldWalletRefund) });
        await updateDoc(doc(db, 'wallets', walletId), { balance: increment(newWalletCharge) });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <div className={styles.header}>
          <h2>Edit Transaction</h2>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.typeSelector}>
            <button 
              type="button" 
              className={`${styles.typeBtn} ${type === 'EXPENSE' ? styles.activeExpense : ''}`}
              onClick={() => setType('EXPENSE')}
            >
              Expense
            </button>
            <button 
              type="button" 
              className={`${styles.typeBtn} ${type === 'INCOME' ? styles.activeIncome : ''}`}
              onClick={() => setType('INCOME')}
            >
              Income
            </button>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.label}>Amount ($)</label>
            <input 
              className={styles.select}
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
            />
          </div>
          
          <div className={styles.selectGroup}>
            <label className={styles.label}>Category</label>
            <input 
              className={styles.select}
              type="text" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              required 
            />
          </div>
          
          <div className={styles.selectGroup}>
            <label className={styles.label}>Wallet</label>
            <select 
              className={styles.select} 
              value={walletId} 
              onChange={(e) => setWalletId(e.target.value)} 
              required
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.label}>Notes</label>
            <input 
              className={styles.select}
              type="text" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)'
            }}
          >
            {loading ? 'Saving...' : 'Update Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};
