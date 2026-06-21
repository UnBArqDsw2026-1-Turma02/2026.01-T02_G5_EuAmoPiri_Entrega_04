import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import FormField from '../presentation/molecules/FormField';
import Button from '../presentation/atoms/Button';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: 'turista' } });

  const selectedRole = watch('role');

  async function onSubmit(data) {
    setServerError('');
    setLoading(true);
    try {
      await authRegister({
        name:     data.name,
        email:    data.email,
        password: data.password,
        role:     data.role,
      });
      navigate('/');
    } catch (err) {
      setServerError(err.message ?? 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.logo}>❤︎ Eu Amo Piri</p>
        <h1 className={styles.title}>Criar conta</h1>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && <p className={styles.serverError}>{serverError}</p>}

          <FormField
            id="name"
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            registration={register('name', { required: 'Nome é obrigatório' })}
            error={errors.name?.message}
          />

          <FormField
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            registration={register('email', {
              required: 'E-mail é obrigatório',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
            })}
            error={errors.email?.message}
          />

          <FormField
            id="password"
            label="Senha"
            type="password"
            placeholder="Mín. 8 caracteres com 1 letra maiúscula"
            registration={register('password', {
              required: 'Senha é obrigatória',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              pattern: { value: /[A-Z]/, message: 'Inclua ao menos 1 letra maiúscula' },
            })}
            error={errors.password?.message}
          />

          {/* Tipo de conta */}
          <div className={styles.roleField}>
            <p className={styles.roleLabel}>Tipo de conta</p>
            <div className={styles.roleOptions}>
              <label className={`${styles.roleOption} ${selectedRole === 'turista' ? styles.roleSelected : ''}`}>
                <input type="radio" value="turista" className={styles.roleRadio} {...register('role')} />
                <span className={styles.roleIcon}>🧭</span>
                <span className={styles.roleText}>
                  <strong>Turista</strong>
                  <small>Explore e avalie locais</small>
                </span>
              </label>
              <label className={`${styles.roleOption} ${selectedRole === 'morador' ? styles.roleSelected : ''}`}>
                <input type="radio" value="morador" className={styles.roleRadio} {...register('role')} />
                <span className={styles.roleIcon}>🏡</span>
                <span className={styles.roleText}>
                  <strong>Morador</strong>
                  <small>Cadastre e gerencie locais</small>
                </span>
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </Button>
        </form>

        <p className={styles.footer}>
          Já tem conta?{' '}
          <Link to="/login" className={styles.link}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
