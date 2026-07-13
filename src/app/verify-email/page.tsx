'use client';

import { useAuth } from '@/components/AuthContext';
import { auth } from '@/lib/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useState } from 'react';
import styles from '../auth.module.css';

export default function VerifyEmail() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setMessage('Verification email sent! Check your inbox.');
      } catch (error: any) {
        setMessage(error.message || 'Failed to send email.');
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleCheckVerification = () => {
    // Reload the user to update the emailVerified property
    if (user) {
      user.reload().then(() => {
        // AuthContext will handle the redirect automatically if verified
        if (!user.emailVerified) {
          setMessage('Still not verified. Check your email or spam folder.');
        }
      });
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Left side Visuals */}
      <div className={styles.visualSection}>
        {/* Animated Background Elements */}
        <div className={styles.floatingCircle1}></div>
        <div className={styles.floatingCircle2}></div>
        <div className={styles.floatingCircle3}></div>
        
        {/* Glassmorphism Cards */}
        <div className={styles.glassCard1}>
          <div className={styles.glassCardLine}></div>
          <div className={styles.glassCardLineShort}></div>
        </div>
        <div className={styles.glassCard2}>
           <div className={styles.glassCardCircle}></div>
           <div className={styles.glassCardLineShort}></div>
        </div>

        <div className={styles.visualContent}>
          <h2>
            Secure Your Account.
            <span className={styles.dynamicEqualizer}>
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
            </span>
          </h2>
          <p>Please verify your email address to access your premium dashboard and start tracking your finances.</p>
        </div>
      </div>

      {/* Right side Form */}
      <div className={styles.formSection}>
        <div className={styles.authCard} style={{ textAlign: 'center' }}>
          <h1 className={styles.authTitle}>Verify your Email</h1>
        <p className={styles.authSubtitle}>
          We've sent a verification link to <strong>{user?.email}</strong>.
          Please click the link in the email to activate your account.
        </p>

        {message && <div style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>{message}</div>}

        <button onClick={handleCheckVerification} className={styles.submitBtn} style={{ marginBottom: '12px' }}>
          I've verified my email
        </button>

        <button onClick={handleResend} className={styles.submitBtn} style={{ backgroundColor: 'white', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
          Resend Email
        </button>

        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', textDecoration: 'underline' }}>
          Logout & Try another account
        </button>
        </div>
      </div>
    </div>
  );
}
