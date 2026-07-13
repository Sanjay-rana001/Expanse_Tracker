'use client';

import React, { useState, useEffect } from 'react';
import styles from './AddTransactionModal.module.css';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

interface Wallet {
  id: string;
  name: string;
  balance: number;
}

export const AddTransactionModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const { user, currencySymbol } = useAuth();
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [walletId, setWalletId] = useState('');
  const [notes, setNotes] = useState('');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchWallets = async () => {
      const wQuery = query(collection(db, 'wallets'), where('userId', '==', user.uid));
      const wSnapshot = await getDocs(wQuery);
      const wData = wSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Wallet, 'id'>) }));
      setWallets(wData);
      if (wData.length > 0) setWalletId(wData[0].id);
    };
    fetchWallets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!walletId || !user) {
      setError('Please select or create a wallet first.');
      return;
    }

    setLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      
      // 1. Add Transaction
      await addDoc(collection(db, 'transactions'), {
        amount: parsedAmount,
        type,
        category,
        walletId,
        notes,
        userId: user.uid,
        date: new Date().toISOString()
      });

      // 2. Update Wallet Balance
      const walletRef = doc(db, 'wallets', walletId);
      const balanceChange = type === 'EXPENSE' ? -parsedAmount : parsedAmount;
      await updateDoc(walletRef, {
        balance: increment(balanceChange)
      });

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
          <h2>Add Transaction</h2>
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
            <label className={styles.label}>Amount ({currencySymbol})</label>
            <input 
              className={styles.select}
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              placeholder="0.00"
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
              placeholder="e.g., Groceries, Rent, Salary"
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
              <option value="" disabled>Select Wallet</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({currencySymbol}{w.balance.toFixed(2)})</option>
              ))}
            </select>
            {wallets.length === 0 && <span className={styles.hint}>No wallets found. Create one first!</span>}
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.label}>Notes (Optional)</label>
            <input 
              className={styles.select}
              type="text" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add details..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || wallets.length === 0}
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
            {loading ? 'Saving...' : `Save ${type === 'EXPENSE' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      </div>
    </div>
  );
};
