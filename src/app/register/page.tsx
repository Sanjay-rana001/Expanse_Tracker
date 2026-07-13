'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import styles from '../auth.module.css';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      // AuthContext will handle redirect
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // AuthContext will handle redirect
    } catch (err: any) {
      setError(err.message || 'Google signup failed');
    }
  };

  return (
    <div className={styles.authContainer}>
      
      {/* Left side Visuals */}
      <div className={styles.visualSection}>
        <div className={styles.visualContent}>
          <h2>Start Your Journey.</h2>
          <p>Get exclusive access to the world's most intuitive and powerful personal finance tracking platform.</p>
        </div>
      </div>

      {/* Right side Form */}
      <div className={styles.formSection}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Create Account</h1>
          <p className={styles.authSubtitle}>Sign up to start tracking your expenses securely.</p>
          
          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="button"
            onClick={handleGoogleSignup}
            className={styles.googleBtn} 
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className={styles.divider}>or register with email</div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name"
                className={styles.input} 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                placeholder="John Doe"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email address</label>
              <input 
                type="email" 
                id="email"
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                placeholder="you@company.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className={styles.switchAuth}>
            Already have an account? <Link href="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
