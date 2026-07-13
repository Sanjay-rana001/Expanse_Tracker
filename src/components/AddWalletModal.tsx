'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import styles from './AddWalletModal.module.css';

export const AddWalletModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const { user, currencySymbol } = useAuth();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'wallets'), {
        name,
        balance: parseFloat(balance),
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet');
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <div className={styles.header}>
          <h2>Create Wallet</h2>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.selectGroup}>
            <label className={styles.label}>Wallet Name</label>
            <input 
              className={styles.input}
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="e.g., Main Checking, Chase Sapphire"
            />
          </div>
          
          <div className={styles.selectGroup}>
            <label className={styles.label}>Initial Balance ({currencySymbol})</label>
            <input 
              className={styles.input}
              type="number" 
              step="0.01" 
              value={balance} 
              onChange={(e) => setBalance(e.target.value)} 
              required 
              placeholder="0.00"
            />
          </div>
          
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Creating...' : 'Create Wallet'}
          </button>
        </form>
      </div>
    </div>
  );
};
