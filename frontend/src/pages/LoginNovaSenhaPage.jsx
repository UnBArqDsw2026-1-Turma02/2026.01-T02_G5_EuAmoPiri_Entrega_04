import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import styles from './LoginNovaSenhaPage.module.css';

export default function LoginNovaSenhaPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password', '');

  async function onSubmit(data) {
    setServerError(null);
    try {
      console.log('Enviando nova senha para o backend...', data.password);
      // Avança para a tela de confirmação de sucesso 
      navigate('/recuperar-senha/sucesso');
    } catch (err) {
      setServerError(err.message ?? 'Erro ao redefinir a senha. Tente novamente.');
    }
  } 

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        
        <div className={styles.stepsContainer}>
          <div className={`${styles.stepItem} ${styles.activeStep}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>EMAIL</span>
          </div>
          <div className={styles.stepLineActive}></div>
          <div className={`${styles.stepItem} ${styles.activeStep}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>CÓDIGO</span>
          </div>
          <div className={styles.stepLineActive}></div>
          <div className={`${styles.stepItem} ${styles.activeStep}`}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepLabel}>NOVA SENHA</span>
          </div>
        </div>

        <p className={styles.logo}>❤ EuAmoPiri</p>
        <h1 className={styles.title}>Nova Senha</h1>
        <p className={styles.subtitle}>
          Sua nova senha deve ter mais de 6 caracteres, incluindo números, caracteres especiais e letras maiúsculas.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          
          <FormField
            id="password"
            label="INSIRA SUA NOVA SENHA"
            type="password"
            placeholder="#EuAmoPiri2026"
            registration={register('password', {
              required: 'A nova senha é obrigatória',
              minLength: { value: 6, message: 'A senha deve ter mais de 6 caracteres' },
            })}
            error={errors.password?.message}
          />

          <FormField
            id="confirmPassword"
            label="CONFIRME SUA NOVA SENHA"
            type="password"
            placeholder="#EuAmoPiri2026"
            registration={register('confirmPassword', {
              required: 'A confirmação de senha é obrigatória',
              validate: value => value === password || 'As senhas não conferem',
            })}
            error={errors.confirmPassword?.message}
          />

          {serverError && (
            <p className={styles.serverError} role="alert">{serverError}</p>
          )}

          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={() => navigate('/recuperar-senha/codigo')}>
              Voltar
            </Button>
            <Button 
              variant="teal" 
              type="submit" 
              loading={isSubmitting}
              className={styles.primaryButton}
            >
              CRIAR NOVA SENHA
            </Button>
          </div>
        </form>

        <p className={styles.footerText}>
          Ocorreu algum problema durante o processo? <Link to="/login" className={styles.loginLink}>Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
} 