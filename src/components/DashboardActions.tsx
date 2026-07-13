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
    { id: 'midnight', color: '#18181b', name: 'Midnight', border: '#3f3f46' },
    { id: 'ocean', color: '#0f172a', name: 'Ocean', border: '#334155' },
    { id: 'emerald', color: '#064e3b', name: 'Emerald', border: '#047857' },
    { id: 'sunset', color: '#3f0f24', name: 'Sunset', border: '#881337' },
    { id: 'light', color: '#f8fafc', name: 'Light', border: '#e2e8f0' }
  ];

  const handleSelectTheme = async (newTheme: string) => {
    try {
      await setDoc(doc(db, 'userSettings', user.uid), { theme: newTheme }, { merge: true });
      setIsThemeDropdownOpen(false);
    } catch (error) {
      console.error('Failed to update theme', error);
    }
  };

  const getRadialPos = (index: number, total: number) => {
    const radius = 65;
    const startAngle = Math.PI / 2; // Bottom (90 degrees)
    const endAngle = Math.PI;       // Left (180 degrees)
    const angle = startAngle + (index / (total - 1)) * (endAngle - startAngle);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              {THEMES.map((t, i) => {
                const pos = getRadialPos(i, THEMES.length);
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    title={t.name}
                    className={`${styles.themeCircle} ${theme === t.id ? styles.themeCircleActive : ''}`}
                    style={{ 
                      backgroundColor: t.color, 
                      borderColor: t.border || 'var(--color-border)',
                      color: t.id === 'light' ? '#000000' : '#ffffff'
                    }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{ x: pos.x, y: pos.y, scale: 1, opacity: 1 }}
                    exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.05 }}
                  >
                    {theme === t.id && <Check size={16} />}
                  </motion.button>
                );
              })}
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
