'use client';

import React, { useState, useEffect } from 'react';
import { AddTransactionModal } from './AddTransactionModal';
import { AddWalletModal } from './AddWalletModal';
import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Plus, Wallet, Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DashboardActions.module.css';

export const DashboardActions = () => {
  const { user, theme } = useAuth();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
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

  const THEMES = [
    { id: 'midnight', color: '#0a0a0a', name: 'Midnight' },
    { id: 'ocean', color: '#0f172a', name: 'Ocean' },
    { id: 'emerald', color: '#064e3b', name: 'Emerald' },
    { id: 'sunset', color: '#3f0f24', name: 'Sunset' },
    { id: 'light', color: '#ffffff', name: 'Light', border: '#cbd5e1' }
  ];

  const handleSelectTheme = async (newTheme: string) => {
    try {
      await setDoc(doc(db, 'userSettings', user.uid), { theme: newTheme }, { merge: true });
      setIsThemeDropdownOpen(false);
    } catch (error) {
      console.error('Failed to update theme', error);
    }
  };

  return (
    <div className={styles.actionsContainer}>
      <div className={styles.themeDropdownContainer}>
        <button 
          className={styles.secondaryBtn} 
          onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)} 
          title="Change Theme"
        >
          <Palette size={18} />
        </button>

        <AnimatePresence>
          {isThemeDropdownOpen && (
            <motion.div 
              className={styles.themeDropdown}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTheme(t.id)}
                  title={t.name}
                  className={`${styles.themeCircle} ${theme === t.id ? styles.themeCircleActive : ''}`}
                  style={{ 
                    backgroundColor: t.color, 
                    borderColor: t.border || 'var(--color-border)',
                    color: t.id === 'light' ? '#000000' : '#ffffff'
                  }}
                >
                  {theme === t.id && <Check size={16} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
