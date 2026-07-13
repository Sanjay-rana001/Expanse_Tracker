'use client';

import React, { useState, useEffect } from 'react';
import { AddTransactionModal } from './AddTransactionModal';
import { AddWalletModal } from './AddWalletModal';
import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Plus, Wallet } from 'lucide-react';
import styles from './DashboardActions.module.css';

export const DashboardActions = () => {
  const { user } = useAuth();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [hasWallets, setHasWallets] = useState(true); // default true to avoid flash
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const wQuery = query(collection(db, 'wallets'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(wQuery, (snapshot) => {
      setHasWallets(!snapshot.empty);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className={styles.actionsContainer}>
      {!hasWallets ? (
        <button className={styles.primaryBtn} onClick={() => setIsWalletModalOpen(true)}>
          <Wallet size={18} /> Add Wallet
        </button>
      ) : (
        <button className={styles.primaryBtn} onClick={() => setIsTxModalOpen(true)}>
          <Plus size={18} /> Add Transaction
        </button>
      )}

      {isTxModalOpen && (
        <AddTransactionModal 
          onClose={() => setIsTxModalOpen(false)} 
          onSuccess={() => setIsTxModalOpen(false)} 
        />
      )}

      {isWalletModalOpen && (
        <AddWalletModal 
          onClose={() => setIsWalletModalOpen(false)} 
          onSuccess={() => setIsWalletModalOpen(false)} 
        />
      )}
    </div>
  );
};
