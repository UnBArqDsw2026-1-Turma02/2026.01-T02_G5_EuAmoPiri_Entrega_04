import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import {
  clearRegisterDraft,
  getRegisterDraft,
} from '../api/auth/authSessionStorage';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import styles from './RegisterPasswordPage.module.css';

function validatePasswordStrength(password) {
  if (password.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Senha deve conter letras maiúsculas (A-Z)';
  if (!/[a-z]/.test(password)) return 'Senha deve conter letras minúsculas (a-z)';
  if (!/[0-9]/.test(password)) return 'Senha deve conter números (0-9)';
  return true;
}

function getStrengthLevel(password) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
  ];
  const passed = checks.filter(Boolean).length;
  if (passed <= 1) return { label: 'FRACA', width: '25%', color: '#d32f2f' };
  if (passed <= 2) return { label: 'MÉDIA', width: '50%', color: '#ffa500' };
  if (passed <= 3) return { label: 'BOA', width: '75%', color: '#658c2b' };
  return { label: 'FORTE', width: '100%', color: '#658c2b' };
}

export default function RegisterPasswordPage() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const [draft] = useState(() => getRegisterDraft());
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password', '');
  const strength = getStrengthLevel(password);

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  useEffect(() => {
    if (!draft) {
      navigate('/cadastro', { replace: true });
    }
  }, [draft, navigate]);

  if (!draft) return null;

  async function onSubmit({ password }) {
    setServerError(null);
    try {
      await authRegister({
        name: draft.name,
        email: draft.email,
        password,
        role: draft.role,
        birthDate: draft.birthDate,
        phone: draft.phone,
      });
      clearRegisterDraft();
      navigate('/cadastro/sucesso', { replace: true });
    } catch (err) {
      setServerError(err.message ?? 'Erro ao criar conta');
    }
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
            registration={register('password', {
              required: 'Senha é obrigatória',
              validate: validatePasswordStrength,
            })}
            error={errors.password?.message}
          />

          {password && (
            <div className={styles.strengthBarContainer}>
              <div
                className={styles.strengthBar}
                style={{ width: strength.width, backgroundColor: strength.color }}
              />
              <span className={styles.strengthText} style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}

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

          {serverError && (
            <p className={styles.serverError} role="alert">{serverError}</p>
          )}

          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={() => navigate('/cadastro')}>
              Voltar
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Criar conta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
