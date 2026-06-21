import { useNavigate } from 'react-router-dom';
import Button from '../presentation/atoms/Button';
import styles from './RegisterSuccessPage.module.css';

export default function RegisterSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.logo}>❤ EuAmoPiri</p>
        
        <div className={styles.iconContainer}>
          <span className={styles.checkIcon} role="img" aria-label="Conta criada com sucesso">✅</span>
        </div>

        <h1 className={styles.title}>Bem-vindo!</h1>
        <p className={styles.subtitle}>Sua conta foi criada com sucesso.</p>

        <Button variant="primary" fullWidth onClick={() => navigate('/')}>
          Acessar o Site
        </Button>
      </div>
    </div>
  );
}