'use client';

import { useAuth } from '@/components/AuthContext';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { DashboardLayout } from '@/components/DashboardLayout';
import { updateProfile } from 'firebase/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await updateProfile(user, {
        displayName: displayName
      });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      console.error("Error updating profile", error);
      setMessage({ text: error.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.welcome}>
            <h1>Settings</h1>
            <p>Manage your account preferences and profile.</p>
          </div>
        </header>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profile Information</h2>
          
          {message.text && (
            <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                className={styles.input} 
                value={user.email || ''} 
                disabled 
              />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Your email address cannot be changed.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Display Name</label>
              <input 
                type="text" 
                className={styles.input} 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="John Doe"
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
