/**
 * ORGANISMO — Footer
 */
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>
          <span className={styles.heart}>&#10084;&#65038;</span> Eu Amo Piri
        </p>
        <nav className={styles.links} aria-label="Links do rodapé">
          <Link to="/sobre-piri" className={styles.link}>Sobre Piri</Link>
          <a
            href="https://github.com/UnBArqDsw2026-1-Turma02/2026.01-T02_G5_EuAmoPiri_Entrega_04"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
