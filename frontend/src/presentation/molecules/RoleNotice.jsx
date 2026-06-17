import { Link } from 'react-router-dom';
import Button from '../atoms/Button';
import styles from './RoleNotice.module.css';

export default function RoleNotice({ title, message, backTo, backLabel = 'Voltar' }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden="true">⚠️</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        {backTo && (
          <Button variant="primary" as={Link} to={backTo}>{backLabel}</Button>
        )}
      </div>
    </div>
  );
}
