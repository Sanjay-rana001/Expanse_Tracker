'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
          return;
        }

        // User is verified (Email)
        if (pathname === '/login' || pathname === '/register' || pathname === '/verify-email') {
          router.push('/');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
