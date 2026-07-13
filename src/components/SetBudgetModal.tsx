'use client';

import React, { useState } from 'react';
import styles from './AddTransactionModal.module.css'; // Reusing premium CSS
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export const SetBudgetModal = ({ currentBudget, onClose, onSuccess }: { currentBudget: number, onClose: () => void, onSuccess: () => void }) => {
  const { user } = useAuth();
  const [budget, setBudget] = useState(currentBudget ? currentBudget.toString() : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      await setDoc(doc(db, 'userSettings', user.uid), {
        budget: parseFloat(budget) || 0
      }, { merge: true });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update budget');
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <div className={styles.header}>
          <h2>Set Monthly Budget</h2>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.selectGroup}>
            <label className={styles.label}>Monthly Limit ($)</label>
            <input 
              className={styles.select}
              type="number" 
              step="1" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
              required 
              placeholder="e.g. 5000"
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
            {loading ? 'Saving...' : 'Save Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};
