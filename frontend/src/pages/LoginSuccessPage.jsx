import { useNavigate } from 'react-router-dom';
import Button from '../presentation/atoms/Button';
import styles from './LoginSuccessPage.module.css';

export default function LoginSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.logo}>❤ EuAmoPiri</p>
        
        {/* Ícone */}
        <div className={styles.iconContainer}>
          <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
            <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        <h1 className={styles.title}>Sua senha foi redefinida</h1>
        <p className={styles.subtitle}>Tudo pronto! Use sua nova senha para entrar na sua conta.</p>

        {/* Reutilizando o átomo Button */}
        <Button variant="teal" fullWidth onClick={() => navigate('/login')}>
        Acessar o Site
    </Button>

      </div>
    </div>
  );
}
