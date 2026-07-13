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
import { Eye, EyeOff, Plus, Trash2, Check } from 'lucide-react';

const THEMES = [
  { id: 'midnight', name: 'Midnight Indigo', className: 'themeBtnMidnight' },
  { id: 'ocean', name: 'Ocean Blue', className: 'themeBtnOcean' },
  { id: 'emerald', name: 'Emerald Forest', className: 'themeBtnEmerald' },
  { id: 'sunset', name: 'Sunset Rose', className: 'themeBtnSunset' },
  { id: 'light', name: 'Solar Light', className: 'themeBtnLight' }
];

export default function SettingsPage() {
  const { user, categories, theme } = useAuth();
  const router = useRouter();
  
  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

  // Preferences State
  const [currency, setCurrency] = useState('INR');
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefMessage, setPrefMessage] = useState({ text: '', type: '' });

  // Categories State
  const [newCategory, setNewCategory] = useState('');
  const [catMessage, setCatMessage] = useState({ text: '', type: '' });

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setPrefMessage({ text: 'Preferences updated successfully', type: 'success' });
    } catch (error: any) {
      setPrefMessage({ text: error.message, type: 'error' });
    } finally {
      setPrefLoading(false);
    }
  };

  const handleUpdateTheme = async (newTheme: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'userSettings', user.uid), { theme: newTheme }, { merge: true });
    } catch (error: any) {
      console.error('Failed to update theme', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      setCatMessage({ text: 'Category already exists', type: 'error' });
      return;
    }
    setCatMessage({ text: '', type: '' });
    try {
      const updatedCategories = [...categories, newCategory.trim()];
      await setDoc(doc(db, 'userSettings', user.uid), { categories: updatedCategories }, { merge: true });
      setNewCategory('');
      setCatMessage({ text: 'Category added!', type: 'success' });
    } catch (error: any) {
      setCatMessage({ text: error.message, type: 'error' });
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (!user) return;
    try {
      const updatedCategories = categories.filter(c => c !== catToDelete);
      await setDoc(doc(db, 'userSettings', user.uid), { categories: updatedCategories }, { merge: true });
    } catch (error: any) {
      setCatMessage({ text: error.message, type: 'error' });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSecLoading(true);
    setSecMessage({ text: '', type: '' });

    // Check if user is signed in with Google
    const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');
    if (isGoogleUser) {
      setSecMessage({ text: 'You are signed in with Google. Password changes are managed through your Google account.', type: 'error' });
      setSecLoading(false);
      return;
    }

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
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="CHF">CHF</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="NZD">NZD ($)</option>
                  <option value="SGD">SGD ($)</option>
                  <option value="HKD">HKD ($)</option>
                  <option value="ZAR">ZAR (R)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="RUB">RUB (₽)</option>
                  <option value="KRW">KRW (₩)</option>
                  <option value="MXN">MXN ($)</option>
                </select>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={prefLoading}>
                {prefLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </motion.div>

          {/* APPEARANCE CARD */}
          <motion.div variants={itemVariants} className={styles.card}>
            <h2 className={styles.cardTitle}>Appearance</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              Personalize your dashboard with a stunning theme.
            </p>
            <div className={styles.themeSelector}>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleUpdateTheme(t.id)}
                  className={`${styles.themeBtn} ${styles[t.className]} ${theme === t.id ? styles.themeBtnActive : ''}`}
                  title={t.name}
                >
                  {theme === t.id && <Check size={20} />}
                </button>
              ))}
            </div>
          </motion.div>

          {/* CATEGORIES CARD */}
          <motion.div variants={itemVariants} className={styles.card}>
            <h2 className={styles.cardTitle}>Manage Categories</h2>
            {catMessage.text && (
              <div className={`${styles.message} ${catMessage.type === 'error' ? styles.error : styles.success}`}>
                {catMessage.text}
              </div>
            )}
            <form onSubmit={handleAddCategory} className={styles.formGroup} style={{ flexDirection: 'row' }}>
              <input 
                type="text" 
                className={styles.input} 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)} 
                placeholder="New category name"
                required
              />
              <button type="submit" className={styles.submitBtn} style={{ padding: '14px', flexShrink: 0 }}>
                <Plus size={20} />
              </button>
            </form>

            <div className={styles.categoryList}>
              {categories.map((cat, index) => (
                <div key={index} className={styles.categoryItem}>
                  <span>{cat}</span>
                  <button 
                    type="button" 
                    onClick={() => handleDeleteCategory(cat)}
                    className={styles.deleteCatBtn}
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
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
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className={styles.input} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Enter a strong new password"
                    required
                    minLength={6}
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
