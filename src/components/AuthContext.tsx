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
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  currency: 'USD',
  currencySymbol: '$'
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const router = useRouter();
  const pathname = usePathname();

  const getSymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      case 'USD':
      default: return '$';
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
      if (docSnap.exists() && docSnap.data().currency) {
        const curr = docSnap.data().currency;
        setCurrency(curr);
        setCurrencySymbol(getSymbol(curr));
      } else {
        setCurrency('USD');
        setCurrencySymbol('$');
      }
    });
    return () => unsubSettings();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, currency, currencySymbol }}>
      {loading ? <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
