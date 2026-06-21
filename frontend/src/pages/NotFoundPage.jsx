import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code} aria-hidden="true">404</p>
        <h1 className={styles.title}>Página não encontrada</h1>
        <p className={styles.text}>
          O endereço que você acessou não existe ou foi movido.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.link}>Ir para início</Link>
          <Link to="/locais" className={styles.secondaryLink}>Ver locais</Link>
        </div>
      </div>
    </main>
  );
}
