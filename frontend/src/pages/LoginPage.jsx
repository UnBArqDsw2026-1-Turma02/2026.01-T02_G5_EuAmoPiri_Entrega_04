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
  const from      = location.state?.from ?? '/';

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

        <p className={styles.logo}>❤ EuAmoPiri</p>
        <h1 className={styles.title}>Entrar na sua conta</h1>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            registration={register('email', {
              required: 'E-mail é obrigatório',
              pattern: { value: /\S+@\S+\.\S+/, message: 'E-mail inválido' },
            })}
            error={errors.email?.message}
          />

          <FormField
            id="password"
            label="Senha"
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

          <Button variant="primary" type="submit" fullWidth loading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <p className={styles.footer}>
          Não tem conta?{' '}
          <Link to="/cadastro" className={styles.link}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
