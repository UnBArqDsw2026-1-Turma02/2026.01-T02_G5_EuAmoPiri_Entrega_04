/**
 * ÁTOMO — Spinner
 * Indicador de carregamento. Reutilizado em: PageLoader, botões, cards.
 */
import styles from './Spinner.module.css';

export default function Spinner({ size = 'md', color = 'primary' }) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]} ${styles[color]}`}
      role="status"
      aria-label="Carregando..."
    />
  );
}
