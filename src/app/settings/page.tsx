'use client';

import { useAuth } from '@/components/AuthContext';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { DashboardLayout } from '@/components/DashboardLayout';
import { updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

  // Preferences State
  const [currency, setCurrency] = useState('USD');
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefMessage, setPrefMessage] = useState({ text: '', type: '' });

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [secLoading, setSecLoading] = useState(false);
  const [secMessage, setSecMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      
      const unsub = onSnapshot(doc(db, 'userSettings', user.uid), (docSnap) => {
        if (docSnap.exists() && docSnap.data().currency) {
          setCurrency(docSnap.data().currency);
        }
      });
      return () => unsub();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    setProfileMessage({ text: '', type: '' });
    try {
      await updateProfile(user, { displayName });
      setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      setProfileMessage({ text: error.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPrefLoading(true);
    setPrefMessage({ text: '', type: '' });
    try {
      await setDoc(doc(db, 'userSettings', user.uid), { currency }, { merge: true });
      setPrefMessage({ text: 'Preferences updated successfully!', type: 'success' });
    } catch (error: any) {
      setPrefMessage({ text: 'Failed to update preferences.', type: 'error' });
    } finally {
      setPrefLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSecLoading(true);
    setSecMessage({ text: '', type: '' });
    try {
      await updatePassword(user, newPassword);
      setSecMessage({ text: 'Password updated successfully!', type: 'success' });
      setNewPassword('');
    } catch (error: any) {
      setSecMessage({ text: error.message || 'Failed to update password. Try logging out and back in first.', type: 'error' });
    } finally {
      setSecLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data.");
    if (!confirmDelete) return;

    try {
      await deleteUser(user);
      router.push('/login');
    } catch (error: any) {
      alert(error.message || 'Failed to delete account. You may need to log out and log back in first.');
    }
  };

  if (!user) return null;

  // Framer Motion Variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <motion.header 
          className={styles.header}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.welcome}>
            <h1>Settings</h1>
            <p>Manage your account preferences and profile.</p>
          </div>
        </motion.header>

        <motion.div 
          className={styles.settingsGrid}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* PROFILE */}
          <motion.div className={styles.card} variants={itemVariants}>
            <h2 className={styles.cardTitle}>Profile Information</h2>
            {profileMessage.text && (
              <div className={`${styles.message} ${profileMessage.type === 'success' ? styles.success : styles.error}`}>
                {profileMessage.text}
              </div>
            )}
            <form onSubmit={handleUpdateProfile}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" className={styles.input} value={user.email || ''} disabled />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Display Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </motion.div>

          {/* PREFERENCES */}
          <motion.div className={styles.card} variants={itemVariants}>
            <h2 className={styles.cardTitle}>Preferences</h2>
            {prefMessage.text && (
              <div className={`${styles.message} ${prefMessage.type === 'success' ? styles.success : styles.error}`}>
                {prefMessage.text}
              </div>
            )}
            <form onSubmit={handleUpdatePreferences}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Currency</label>
                <select 
                  className={styles.input} 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={prefLoading}>
                {prefLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </motion.div>

          {/* SECURITY */}
          <motion.div className={styles.card} variants={itemVariants}>
            <h2 className={styles.cardTitle}>Security</h2>
            {secMessage.text && (
              <div className={`${styles.message} ${secMessage.type === 'success' ? styles.success : styles.error}`}>
                {secMessage.text}
              </div>
            )}
            <form onSubmit={handleUpdatePassword}>
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <input 
                  type="password" 
                  className={styles.input} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter a strong new password"
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={secLoading || !newPassword}>
                {secLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>

          {/* DANGER ZONE */}
          <motion.div className={`${styles.card} ${styles.dangerCard}`} variants={itemVariants}>
            <h2 className={styles.cardTitle} style={{ color: 'var(--color-danger)' }}>Danger Zone</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button type="button" className={styles.dangerBtn} onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
