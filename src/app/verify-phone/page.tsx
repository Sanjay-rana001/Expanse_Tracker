'use client';

import { useAuth } from '@/components/AuthContext';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, linkWithPhoneNumber, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function VerifyPhone() {
  const { user } = useAuth();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize Recaptcha
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!user) return;

    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const confirmation = await linkWithPhoneNumber(user, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setMessage('Verification code sent! Please check your messages.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send verification code. Ensure the number includes the country code (e.g. +1).');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await confirmationResult.confirm(otp);
      // Phone is now linked and verified!
      // AuthContext will automatically redirect to Dashboard because user.phoneNumber will now be populated
      setMessage('Phone verified successfully!');
      router.push('/');
    } catch (err: any) {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Verify your Phone</h1>
        <p className={styles.authSubtitle}>Please link your phone number to secure your account.</p>
        
        {error && <div className={styles.error}>{error}</div>}
        {message && <div style={{ color: 'var(--color-success)', marginBottom: '16px', textAlign: 'center' }}>{message}</div>}

        <div id="recaptcha-container"></div>

        {!confirmationResult ? (
          <form onSubmit={handleSendCode}>
            <div className={styles.formGroup}>
              <label>Phone Number (with Country Code)</label>
              <input 
                type="tel" 
                placeholder="+1 234 567 8900"
                className={styles.input} 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className={styles.submitBtn}>
              Send SMS Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div className={styles.formGroup}>
              <label>Enter 6-digit Code</label>
              <input 
                type="text" 
                className={styles.input} 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className={styles.submitBtn}>
              Verify & Complete Setup
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button onClick={() => signOut(auth)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Add to window object for TS
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
