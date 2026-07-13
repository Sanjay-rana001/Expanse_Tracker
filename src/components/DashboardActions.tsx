'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { AddTransactionModal } from './AddTransactionModal';
import { useRouter } from 'next/navigation';

export const DashboardActions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setIsModalOpen(false);
    router.refresh(); // Refresh the dashboard to fetch new data
  };

  return (
    <div style={{ marginTop: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
      <Button variant="primary" onClick={() => setIsModalOpen(true)}>
        + Add Transaction
      </Button>
      <Button variant="secondary" onClick={() => alert('Wallets page coming soon!')}>
        Manage Wallets
      </Button>

      {isModalOpen && (
        <AddTransactionModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};
