import { Link } from 'react-router-dom';
import Button from '../atoms/Button';
import styles from './FormResultModal.module.css';

export default function FormResultModal({
  variant = 'success',
  title,
  text,
  primaryAction,
  secondaryAction,
  onClose,
}) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={`${styles.card} ${variant === 'error' ? styles.error : ''} ${variant === 'warning' ? styles.warning : ''}`}>
        <p className={styles.logo}>❤ EuAmoPiri</p>
        <span className={styles.icon} aria-hidden="true">
          {variant === 'success' ? '✓' : '⚠️'}
        </span>
        <h2 className={styles.title}>{title}</h2>
        {text && <p className={styles.text}>{text}</p>}
        <div className={styles.actions}>
          {primaryAction && (
            primaryAction.to
              ? (
                <Button
                  variant="primary"
                  fullWidth
                  as={Link}
                  to={primaryAction.to}
                  replace={primaryAction.replace ?? false}
                >
                  {primaryAction.label}
                </Button>
              )
              : <Button variant="primary" fullWidth onClick={primaryAction.onClick}>{primaryAction.label}</Button>
          )}
          {secondaryAction && (
            secondaryAction.to
              ? (
                <Button
                  variant="neutral"
                  fullWidth
                  as={Link}
                  to={secondaryAction.to}
                  replace={secondaryAction.replace ?? false}
                >
                  {secondaryAction.label}
                </Button>
              )
              : <Button variant="neutral" fullWidth onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
          )}
          {onClose && !secondaryAction && (
            <Button variant="neutral" fullWidth onClick={onClose}>Voltar</Button>
          )}
        </div>
      </div>
    </div>
  );
}
