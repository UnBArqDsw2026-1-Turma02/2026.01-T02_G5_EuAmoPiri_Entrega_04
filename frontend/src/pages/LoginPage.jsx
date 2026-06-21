import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const from      = location.state?.from ?? '/locais';

  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit({ email, password }) {
    setServerError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message ?? 'Erro ao fazer login');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Identidade Visual */}
        <p className={styles.logo}>❤ EuAmoPiri</p>
        <p className={styles.subtitle}>Bem-vindo de volta!</p>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          
          {/* Campo EMAIL reestilizado em maiúsculo via CSS */}
          <FormField
            id="email"
            label="EMAIL"
            type="email"
            placeholder="seu@email.com"
            registration={register('email', {
              required: 'E-mail é obrigatório',
              pattern: { value: /\S+@\S+\.\S+/, message: 'E-mail inválido' },
            })}
            error={errors.email?.message}
          />

          {/* Campo SENHA */}
          <FormField
            id="password"
            label="SENHA"
            type="password"
            placeholder="••••••••"
            registration={register('password', {
              required: 'Senha é obrigatória',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
            error={errors.password?.message}
          />

          {serverError && (
            <p className={styles.serverError} role="alert">{serverError}</p>
          )}

          {/* Adicione a className para forçar o verde oliva do layout */}
          <Button
            variant="primary"
            type="submit"
            fullWidth
            loading={isSubmitting}
          >
            Entrar
          </Button>
        </form>

        {/* Links inferiores alinhados nas extremidades */}
        <div className={styles.footerLinks}>
          <Link to="/recuperar-senha" className={styles.link}>Esqueci a senha</Link>
          <Link to="/cadastro" className={styles.link}>Criar conta</Link>
        </div>

      </div>
    </div>
  );
}
