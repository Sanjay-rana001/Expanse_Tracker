import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { User } from 'firebase/auth';
import styles from './AddTransactionModal.module.css';

export const WelcomeNameModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: name.trim() });
      onClose(); // Will close and the dashboard will refresh
      // Reload page to reflect user name changes if necessary
      window.location.reload(); 
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard} style={{ maxWidth: '400px' }}>
        <div className={styles.header}>
          <h2>Welcome to Expanse!</h2>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
          What should we call you? Please enter your name so we can personalize your dashboard.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.selectGroup}>
            <label className={styles.label}>Your Name</label>
            <input 
              className={styles.select}
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="e.g., Sanjay"
              autoFocus
            />
          </div>

          <div className={styles.actions} style={{ marginTop: '16px' }}>
            <button type="submit" className={styles.submitBtn} disabled={loading || !name.trim()}>
              {loading ? 'Saving...' : 'Get Started'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
