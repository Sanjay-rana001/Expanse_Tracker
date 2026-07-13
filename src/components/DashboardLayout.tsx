'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, CreditCard, Wallet, PieChart as PieChartIcon, Settings, LogOut, Activity, Menu, X } from 'lucide-react';
import styles from './DashboardLayout.module.css';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={styles.layout}>
      
      {/* MOBILE HEADER */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileLogo}>
          <Activity size={24} color="var(--color-primary)" />
          Expanse
        </div>
        <button className={styles.hamburgerBtn} onClick={toggleSidebar}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      <div 
        className={`${styles.mobileOverlay} ${sidebarOpen ? styles.mobileOverlayOpen : ''}`}
        onClick={closeSidebar}
      />

      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <Activity size={28} color="var(--color-primary)" />
          Expanse
        </div>
        
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : ''}`} onClick={closeSidebar}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/transactions" className={`${styles.navItem} ${pathname === '/transactions' ? styles.navItemActive : ''}`} onClick={closeSidebar}>
            <CreditCard size={20} /> Transactions
          </Link>
          <Link href="/wallets" className={`${styles.navItem} ${pathname === '/wallets' ? styles.navItemActive : ''}`} onClick={closeSidebar}>
            <Wallet size={20} /> Wallets
          </Link>
          <Link href="/analytics" className={`${styles.navItem} ${pathname === '/analytics' ? styles.navItemActive : ''}`} onClick={closeSidebar}>
            <PieChartIcon size={20} /> Analytics
          </Link>
          <Link href="/settings" className={`${styles.navItem} ${pathname === '/settings' ? styles.navItemActive : ''}`} onClick={closeSidebar}>
            <Settings size={20} /> Settings
          </Link>
        </nav>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userEmail}>{user.displayName || user.email}</div>
          </div>
          <button onClick={() => signOut(auth)} className={styles.logoutBtn} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};
