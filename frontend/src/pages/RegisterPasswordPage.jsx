import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import styles from './RegisterPasswordPage.module.css';

export default function RegisterPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password', '');

  // Validações em tempo real 
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  async function onSubmit(data) {
    console.log('Dados da Senha:', data);
    // Integração com a API final acontece aqui
    navigate('/cadastro/sucesso');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.logo}>❤ EuAmoPiri</p>
        <h1 className={styles.title}>Criar Senha</h1>
        <p className={styles.subtitle}>Escolha uma senha forte para proteger sua conta</p>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}></div>
          <span className={styles.progressText}>ETAPA 2 DE 3: SEGURANÇA</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            id="password"
            label="SENHA"
            type="password"
            placeholder="••••••••"
            registration={register('password', { required: 'Senha é obrigatória' })}
            error={errors.password?.message}
          />

          {/* Barra de Força da Senha Ilustrativa */}
          <div className={styles.strengthBarContainer}>
            <div className={styles.strengthBar}></div>
            <span className={styles.strengthText}>MÉDIA</span>
          </div>

          {/* Requisitos da Senha */}
          <div className={styles.requirementsBox}>
            <p className={styles.requirementsTitle}>REQUISITOS DE SENHA:</p>
            <ul className={styles.requirementsList}>
              <li className={hasMinLength ? styles.valid : ''}>Mínimo 8 caracteres</li>
              <li className={hasUpperCase ? styles.valid : ''}>Letras maiúsculas (A-Z)</li>
              <li className={hasLowerCase ? styles.valid : ''}>Letras minúsculas (a-z)</li>
              <li className={hasNumber ? styles.valid : ''}>Números (0-9)</li>
            </ul>
          </div>

          <FormField
            id="confirmPassword"
            label="CONFIRMAR SENHA"
            type="password"
            placeholder="••••••••"
            registration={register('confirmPassword', {
              required: 'Confirmação é obrigatória',
              validate: value => value === password || 'As senhas não conferem',
            })}
            error={errors.confirmPassword?.message}
          />

          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={() => navigate('/cadastro')}>
              Voltar
            </Button>
            <Button variant="teal" type="submit" loading={isSubmitting}>
              Próximo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}