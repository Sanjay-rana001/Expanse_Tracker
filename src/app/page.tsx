import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import styles from './page.module.css';

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>ExpanseTracker</div>
        <nav className={styles.nav}>
          <div className={`${styles.navItem} ${styles.navItemActive}`}>Dashboard</div>
          <div className={styles.navItem}>Transactions</div>
          <div className={styles.navItem}>Wallets</div>
          <div className={styles.navItem}>Analytics</div>
          <div className={styles.navItem}>Settings</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.welcome}>
            <h1>Welcome back, {session.email.split('@')[0]}!</h1>
            <p>Here's your financial overview for this month.</p>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {session.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Overview Cards */}
        <section className={styles.overviewCards}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Total Balance</div>
            <div className={styles.cardValue}>$0.00</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Monthly Income</div>
            <div className={styles.cardValue} style={{ color: 'var(--color-success)' }}>+$0.00</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Monthly Expenses</div>
            <div className={styles.cardValue} style={{ color: 'var(--color-danger)' }}>-$0.00</div>
          </div>
        </section>

        {/* Chart / Recent Transactions Placeholder */}
        <section className={styles.placeholderSection}>
          [ Transactions & Analytics View Loading... ]
        </section>
      </main>
    </div>
  );
}
