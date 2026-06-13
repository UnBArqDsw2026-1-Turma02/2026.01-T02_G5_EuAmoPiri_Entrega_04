/**
 * ORGANISMO — PageLayout
 *
 * Container de layout padrão que envolve todas as páginas públicas.
 * Garante que o Footer fique sempre no rodapé da viewport (sticky footer).
 *
 * Uso:
 *   <PageLayout>
 *     <HomePage />
 *   </PageLayout>
 *
 * Reutilizado em: AppRoutes (wraps todas as rotas públicas e protegidas).
 */
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './PageLayout.module.css';

export default function PageLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main} id="main-content" tabIndex={-1}>
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
