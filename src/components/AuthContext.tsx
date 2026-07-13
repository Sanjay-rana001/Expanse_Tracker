'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  currency: string;
  currencySymbol: string;
  categories: string[];
  theme: string;
}

const DEFAULT_CATEGORIES = [
  'Food & Dining', 
  'Transportation', 
  'Utilities', 
  'Shopping', 
  'Entertainment', 
  'Healthcare', 
  'Personal Care', 
  'Education', 
  'Others'
];

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  currency: 'INR',
  currencySymbol: '₹',
  categories: DEFAULT_CATEGORIES,
  theme: 'midnight'
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [theme, setTheme] = useState('midnight');
  const router = useRouter();
  const pathname = usePathname();

  const getSymbol = (curr: string) => {
    try {
      const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, minimumFractionDigits: 0, maximumFractionDigits: 0 });
      const parts = formatter.formatToParts(0);
      const symbolPart = parts.find(part => part.type === 'currency');
      return symbolPart ? symbolPart.value : curr;
    } catch (e) {
      return curr; // Fallback to currency code if invalid
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        if (pathname !== '/login' && pathname !== '/register') {
          router.push('/login');
        }
      } else {
        // Enforce Email Verification
        if (!currentUser.emailVerified && currentUser.providerData.some(p => p.providerId === 'password')) {
          if (pathname !== '/verify-email') {
            router.push('/verify-email');
          }
        } else {
          // User is verified
          if (pathname === '/login' || pathname === '/register' || pathname === '/verify-email') {
            router.push('/');
          }
        }
      }
    });

    return () => unsubscribeAuth();
  }, [pathname, router]);

  useEffect(() => {
    if (!user) return;
    const unsubSettings = onSnapshot(doc(db, 'userSettings', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency) {
          setCurrency(data.currency);
          setCurrencySymbol(getSymbol(data.currency));
        }
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
        if (data.theme) {
          setTheme(data.theme);
        } else {
          setTheme('midnight');
        }
      } else {
        setCurrency('USD');
        setCurrencySymbol('$');
        setCategories(DEFAULT_CATEGORIES);
        setTheme('midnight');
      }
    });
    return () => unsubSettings();
  }, [user]);

  // Apply Theme to DOM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <AuthContext.Provider value={{ user, loading, currency, currencySymbol, categories, theme }}>
      {loading ? <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
