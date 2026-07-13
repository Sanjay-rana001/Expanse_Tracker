'use client';

import React, { useState } from 'react';
import { AddTransactionModal } from './AddTransactionModal';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import styles from './DashboardActions.module.css';

export const DashboardActions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setIsModalOpen(false);
    // Hard refresh to fetch new data, but window.location.reload is better for Firestore sync sometimes
    // Or just router.refresh() 
    window.location.reload(); 
  };

  return (
    <div className={styles.actionsContainer}>
      <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
        <Plus size={18} /> Add Transaction
      </button>

      {isModalOpen && (
        <AddTransactionModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};
