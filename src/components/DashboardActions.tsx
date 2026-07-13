'use client';

import React, { useState, useEffect } from 'react';
import { AddTransactionModal } from './AddTransactionModal';
import { AddWalletModal } from './AddWalletModal';
import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Plus, Wallet, Palette } from 'lucide-react';
import styles from './DashboardActions.module.css';

export const DashboardActions = () => {
  const { user, theme } = useAuth();
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

  const THEMES = ['midnight', 'ocean', 'emerald', 'sunset', 'light'];

  const cycleTheme = async () => {
    const currentIndex = THEMES.indexOf(theme || 'midnight');
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
    try {
      await setDoc(doc(db, 'userSettings', user.uid), { theme: nextTheme }, { merge: true });
    } catch (error) {
      console.error('Failed to cycle theme', error);
    }
  };

  return (
    <div className={styles.actionsContainer}>
      <button className={styles.secondaryBtn} onClick={cycleTheme} title="Change Theme">
        <Palette size={18} />
      </button>
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
